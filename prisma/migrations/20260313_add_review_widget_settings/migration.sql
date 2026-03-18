ALTER TABLE "SiteSettings"
ADD COLUMN "reviewsWidgetEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reviewsWidgetLoaderUrl" TEXT NOT NULL DEFAULT 'https://cdn.trustindex.io/loader.js?ver=1',
ADD COLUMN "reviewsWidgetMarkup" TEXT NOT NULL DEFAULT '';
