-- Add SEO columns to BlogPost table
ALTER TABLE "BlogPost" ADD COLUMN "category_slug" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "meta_title" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "meta_description" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "keywords" TEXT[];