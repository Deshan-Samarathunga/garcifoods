import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="page-main">
      <section className="section">
        <div className="container narrow">
          <div className="contact-form">
            <p className="eyebrow">404</p>
            <h1>Page not found</h1>
            <p>The page you requested does not exist in the migrated Garci app.</p>
            <div className="contact-actions">
              <Link className="btn btn-primary" href="/">
                Back Home
              </Link>
              <Link className="btn btn-secondary" href="/contact">
                Contact Garci
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
