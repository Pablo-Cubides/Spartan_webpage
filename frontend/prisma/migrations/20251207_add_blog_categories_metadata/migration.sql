-- CreateTable BlogCategory
CREATE TABLE "BlogCategory" (
    "id" SERIAL NOT NULL,
    "name_display" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "featured_image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable SocialLink
CREATE TABLE "SocialLink" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex BlogCategory_slug_key
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex SocialLink_user_id_platform_key
CREATE UNIQUE INDEX "SocialLink_user_id_platform_key" ON "SocialLink"("user_id", "platform");

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "bio" TEXT;

-- AlterTable BlogPost
ALTER TABLE "BlogPost" 
ADD COLUMN "category_id" INTEGER,
ADD COLUMN "meta_title" TEXT,
ADD COLUMN "meta_description" TEXT,
ADD COLUMN "slug_canonical" TEXT,
ADD COLUMN "cover_image_alt" TEXT,
ADD COLUMN "expertise_areas" TEXT,
ADD COLUMN "tags" TEXT,
ADD COLUMN "reading_time_minutes" INTEGER,
ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
