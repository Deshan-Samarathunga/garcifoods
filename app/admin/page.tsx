import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminPageSession } from "@/lib/auth";
import {
  countRecentAdminInquiries,
  listAdminInquiries,
  type InquiryDto,
} from "@/lib/services/inquiries";
import { listAdminProducts, type ProductDto } from "@/lib/services/products";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of the Garci admin workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const chartWidth = 760;
const chartHeight = 280;
const chartPadding = 18;
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ActivityItem = {
  id: string;
  type: "inquiry" | "product";
  title: string;
  description: string;
  timestamp: string;
  badge: string;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Unknown";
  }

  return dateFormatter.format(date);
};

const formatRelativeTime = (value: string | null) => {
  if (!value) {
    return "No recent activity";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "No recent activity";
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.valueOf()) / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes || 1}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return formatDateTime(value);
};

const buildLinePath = (values: number[], maxValue: number) => {
  return values
    .map((value, index) => {
      const x =
        chartPadding + (index * (chartWidth - chartPadding * 2)) / Math.max(values.length - 1, 1);
      const y =
        chartHeight -
        chartPadding -
        (value / Math.max(maxValue, 1)) * (chartHeight - chartPadding * 2);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const buildAreaPath = (values: number[], maxValue: number) => {
  const linePath = buildLinePath(values, maxValue);
  const endX = chartWidth - chartPadding;
  const endY = chartHeight - chartPadding;
  const startX = chartPadding;

  return `${linePath} L ${endX} ${endY} L ${startX} ${endY} Z`;
};

const getRecentMonthBuckets = (count: number) => {
  const now = new Date();

  return Array.from({ length: count }, (_, index) => {
    const bucketDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - index - 1), 1),
    );

    return {
      key: `${bucketDate.getUTCFullYear()}-${bucketDate.getUTCMonth()}`,
      label: monthFormatter.format(bucketDate),
      year: bucketDate.getUTCFullYear(),
      month: bucketDate.getUTCMonth(),
    };
  });
};

const countActivityByMonth = (
  timestamps: string[],
  buckets: ReturnType<typeof getRecentMonthBuckets>,
) => {
  return buckets.map((bucket) => {
    return timestamps.reduce((count, timestamp) => {
      const date = new Date(timestamp);

      if (
        Number.isNaN(date.valueOf()) ||
        date.getUTCFullYear() !== bucket.year ||
        date.getUTCMonth() !== bucket.month
      ) {
        return count;
      }

      return count + 1;
    }, 0);
  });
};

const createActivityItems = (products: ProductDto[], inquiries: InquiryDto[]): ActivityItem[] => {
  const inquiryItems = inquiries.map<ActivityItem>((inquiry) => ({
    id: `inquiry-${inquiry.id}`,
    type: "inquiry",
    title: inquiry.subject,
    description: `${inquiry.name} (${inquiry.email}) sent a new inquiry.`,
    timestamp: inquiry.createdAt,
    badge: "Inquiry",
  }));

  const productItems = products.map<ActivityItem>((product) => ({
    id: `product-${product.id}`,
    type: "product",
    title: product.name,
    description: `${product.isActive ? "Live" : "Hidden"} product record updated.`,
    timestamp: product.updatedAt,
    badge: "Product",
  }));

  return [...inquiryItems, ...productItems]
    .sort((left, right) => new Date(right.timestamp).valueOf() - new Date(left.timestamp).valueOf())
    .slice(0, 6);
};

export default async function AdminOverviewPage() {
  const session = await requireAdminPageSession();
  let products: ProductDto[] = [];
  let inquiries: InquiryDto[] = [];
  let inquiriesLast7Days = 0;
  let databaseError = false;

  try {
    [products, inquiries, inquiriesLast7Days] = await Promise.all([
      listAdminProducts(),
      listAdminInquiries(),
      countRecentAdminInquiries(7),
    ]);
  } catch {
    databaseError = true;
  }

  const totalProducts = products.length;
  const activeProductsCount = products.filter((product) => product.isActive).length;
  const hiddenProductsCount = totalProducts - activeProductsCount;
  const totalInquiries = inquiries.length;
  const liveCoverage = totalProducts === 0 ? 0 : Math.round((activeProductsCount / totalProducts) * 100);
  const latestProductUpdate =
    [...products].sort((left, right) => {
      return new Date(right.updatedAt).valueOf() - new Date(left.updatedAt).valueOf();
    })[0] ?? null;
  const latestInquiry = inquiries[0] ?? null;
  const latestActivityTime =
    [latestInquiry?.createdAt ?? null, latestProductUpdate?.updatedAt ?? null]
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => new Date(right).valueOf() - new Date(left).valueOf())[0] ?? null;

  const monthBuckets = getRecentMonthBuckets(6);
  const productUpdateSeries = countActivityByMonth(
    products.map((product) => product.updatedAt),
    monthBuckets,
  );
  const inquirySeries = countActivityByMonth(
    inquiries.map((inquiry) => inquiry.createdAt),
    monthBuckets,
  );
  const chartMaxValue = Math.max(...productUpdateSeries, ...inquirySeries, 1);
  const productLine = buildLinePath(productUpdateSeries, chartMaxValue);
  const productArea = buildAreaPath(productUpdateSeries, chartMaxValue);
  const inquiryLine = buildLinePath(inquirySeries, chartMaxValue);
  const inquiryArea = buildAreaPath(inquirySeries, chartMaxValue);

  const activityItems = createActivityItems(products, inquiries);
  const notificationItems = [
    inquiriesLast7Days > 0
      ? {
          title: `${inquiriesLast7Days} new ${inquiriesLast7Days === 1 ? "inquiry" : "inquiries"} in the last 7 days`,
          description: latestInquiry
            ? `Latest message: ${latestInquiry.subject} from ${latestInquiry.name}.`
            : "Recent inquiry activity is starting to come in.",
        }
      : {
          title: "No recent inquiries captured",
          description: "The contact flow has been quiet over the last week.",
        },
    hiddenProductsCount > 0
      ? {
          title: `${hiddenProductsCount} staged ${hiddenProductsCount === 1 ? "product" : "products"} awaiting publish review`,
          description:
            "Hidden records stay in reserve until you release them from the catalog studio.",
        }
      : {
          title: "No staged products waiting",
          description: "Everything in the catalog is currently visible on the public site.",
        },
    latestProductUpdate
      ? {
          title: `${latestProductUpdate.name} was the most recent product update`,
          description: `Updated ${formatRelativeTime(latestProductUpdate.updatedAt)} and currently ${latestProductUpdate.isActive ? "live" : "hidden"}.`,
        }
      : {
          title: "No product updates yet",
          description: "Create the first product record to start the admin activity timeline.",
        },
  ];

  const activityMixTotal = Math.max(activeProductsCount + hiddenProductsCount + Math.max(inquiriesLast7Days, 1), 1);
  const liveMix = Math.round((activeProductsCount / activityMixTotal) * 100);
  const hiddenMix = Math.round((hiddenProductsCount / activityMixTotal) * 100);
  const inquiryPulse = totalInquiries === 0 ? 0 : Math.min(100, Math.round((inquiriesLast7Days / totalInquiries) * 100));

  return (
    <main className="admin-main">
      <section className="admin-page-shell admin-view-shell admin-overview-shell">
        <div className="admin-overview-hero-grid">
          <article className="admin-focus-card is-primary">
            <div className="admin-focus-card-header">
              <p>Catalog visibility</p>
              <span className="admin-focus-dot"></span>
            </div>
            <p className="admin-focus-reading">{liveCoverage}%</p>
            <p className="admin-focus-copy">
              {activeProductsCount} live of {totalProducts} catalog records.
            </p>
            <div className="admin-toggle-row">
              <span>Public site</span>
              <span className={`admin-toggle-pill${activeProductsCount > 0 ? " is-on" : ""}`}>
                <span></span>
              </span>
            </div>
          </article>

          <article className="admin-focus-card is-soft">
            <div className="admin-focus-card-header">
              <p>Inquiry pressure</p>
              <span className="admin-focus-bullet"></span>
            </div>
            <p className="admin-focus-reading is-dark">{totalInquiries}</p>
            <p className="admin-focus-copy is-dark">
              {latestInquiry
                ? `${latestInquiry.subject} arrived ${formatRelativeTime(latestInquiry.createdAt)}.`
                : "No inbound contact activity yet."}
            </p>
            <div className="admin-meter">
              <div className="admin-meter-fill" style={{ width: `${Math.max(inquiryPulse, 8)}%` }}></div>
            </div>
            <p className="admin-meter-caption">{inquiriesLast7Days} recent inquiries in the last 7 days</p>
          </article>

          <article className="admin-donut-card">
            <div className="admin-donut-card-header">
              <p>Workspace split</p>
              <span>{formatRelativeTime(latestActivityTime)}</span>
            </div>

            <div
              className="admin-donut-visual"
              style={{
                background: `conic-gradient(#6f52ff 0 ${liveMix}%, #49d5c8 ${liveMix}% ${liveMix + hiddenMix}%, #ff8a4c ${liveMix + hiddenMix}% 100%)`,
              }}
            >
              <div className="admin-donut-core">
                <strong>{activeProductsCount}</strong>
                <span>live</span>
              </div>
            </div>

            <div className="admin-donut-legend">
              <span>
                <i className="is-purple"></i>
                Live
              </span>
              <span>
                <i className="is-teal"></i>
                Hidden
              </span>
              <span>
                <i className="is-orange"></i>
                Recent inquiries
              </span>
            </div>
            <p className="admin-donut-caption">
              {hiddenProductsCount} hidden products and {inquiriesLast7Days} fresh inquiries shape the
              current admin mix.
            </p>
          </article>
        </div>

        <div className="admin-overview-main-grid">
          <article className="admin-board-card admin-board-chart">
            <div className="admin-board-card-header">
              <div>
                <p className="admin-board-kicker">Operations pulse</p>
                <h2>Activity trend</h2>
              </div>
              <div className="admin-board-chipset">
                <span className="admin-board-chip">Products</span>
                <span className="admin-board-chip is-muted">Inquiries</span>
              </div>
            </div>

            <div className="admin-chart-shell admin-chart-shell-light" aria-hidden="true">
              <div className="admin-chart-gridlines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <svg className="admin-chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="presentation">
                <path className="admin-chart-area is-cyan" d={productArea} />
                <path className="admin-chart-area is-indigo" d={inquiryArea} />
                <path className="admin-chart-line is-cyan" d={productLine} />
                <path className="admin-chart-line is-indigo" d={inquiryLine} />
              </svg>

              <div className="admin-chart-axis">
                {monthBuckets.map((bucket) => (
                  <span key={bucket.key}>{bucket.label}</span>
                ))}
              </div>
            </div>

            <div className="admin-board-stats">
              <article>
                <span>Latest product update</span>
                <strong>{latestProductUpdate ? formatDateTime(latestProductUpdate.updatedAt) : "No data"}</strong>
              </article>
              <article>
                <span>Latest inquiry</span>
                <strong>{latestInquiry ? formatDateTime(latestInquiry.createdAt) : "No data"}</strong>
              </article>
              <article>
                <span>Recent inquiries</span>
                <strong>{inquiriesLast7Days}</strong>
              </article>
              <article>
                <span>Operator</span>
                <strong>{session.user.email}</strong>
              </article>
            </div>
          </article>

          <div className="admin-overview-side-grid">
            <article className="admin-mini-board is-purple">
              <p>Latest publish</p>
              <strong>{latestProductUpdate?.name ?? "No product yet"}</strong>
              <span>{latestProductUpdate ? formatRelativeTime(latestProductUpdate.updatedAt) : "Waiting for edits"}</span>
            </article>
            <article className="admin-mini-board">
              <p>Pending review</p>
              <strong>{hiddenProductsCount}</strong>
              <span>{hiddenProductsCount === 0 ? "Nothing staged" : "Products waiting to go live"}</span>
            </article>
            <article className="admin-mini-board">
              <p>Database status</p>
              <strong>{databaseError ? "Attention" : "Operational"}</strong>
              <span>{databaseError ? "Check PostgreSQL connection" : "Server-backed controls active"}</span>
            </article>
          </div>
        </div>

        <div className="admin-overview-bottom-grid">
          <article className="admin-board-card">
            <div className="admin-board-card-header">
              <div>
                <p className="admin-board-kicker">Live feed</p>
                <h2>Recent activity</h2>
              </div>
              <Link className="admin-board-link" href="/admin/products">
                Open studio
              </Link>
            </div>

            {activityItems.length === 0 ? (
              <div className="admin-board-empty">
                <strong>No activity yet</strong>
                <p>Product updates and inquiry submissions will appear here automatically.</p>
              </div>
            ) : (
              <div className="admin-activity-stream">
                {activityItems.map((item) => (
                  <article key={item.id} className="admin-activity-stream-item">
                    <div className="admin-activity-stream-top">
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </div>
                      <span className={`admin-activity-pill is-${item.type}`}>{item.badge}</span>
                    </div>
                    <div className="admin-activity-stream-meta">
                      <span>{formatDateTime(item.timestamp)}</span>
                      <span>{formatRelativeTime(item.timestamp)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="admin-board-card">
            <div className="admin-board-card-header">
              <div>
                <p className="admin-board-kicker">Signals</p>
                <h2>Notifications</h2>
              </div>
              <span className={`admin-board-status${databaseError ? " is-alert" : ""}`}>
                {databaseError ? "Check setup" : "Healthy"}
              </span>
            </div>

            <div className="admin-notice-stack">
              {notificationItems.map((item) => (
                <article key={item.title} className="admin-notice-card">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
