import { generateBlogPostingSchema, generateCollectionPageSchema, generateBreadcrumbSchema } from "@/lib/blog/schema-generator";

// Mock data para testing
const mockPost = {
  id: 1,
  slug: "test-post",
  title: "Test Post",
  meta_title: "Test Post Title",
  meta_description: "Test description",
  content: "Test content",
  excerpt: "Test excerpt",
  cover_image: "https://example.com/image.jpg",
  cover_image_alt: "Test image",
  reading_time_minutes: 5,
  is_published: true,
  published_at: new Date("2024-12-01"),
  created_at: new Date("2024-12-01"),
  updated_at: new Date("2024-12-01"),
  author_id: 1,
  category_id: 1,
  view_count: 0,
  meta_title: "Test Post",
  meta_description: "Test description",
  slug_canonical: null,
  expertise_areas: ["fitness", "health"],
  tags: ["workout", "training"],
  author: {
    id: 1,
    name: "John Doe",
    bio: "Fitness expert",
    avatar_id: "https://example.com/avatar.jpg",
    email: "john@example.com",
    socialLinks: [
      { id: 1, platform: "linkedin", url: "https://linkedin.com/in/johndoe", user_id: 1, created_at: new Date() },
      { id: 2, platform: "twitter", url: "https://twitter.com/johndoe", user_id: 1, created_at: new Date() },
    ],
  },
  category: {
    id: 1,
    name_display: "Fitness",
    slug: "fitness",
    description: "Fitness articles",
    meta_title: "Fitness",
    meta_description: "Fitness",
    featured_image: "https://example.com/fitness.jpg",
    is_active: true,
    sort_order: 0,
    created_at: new Date(),
    updated_at: new Date(),
  },
};

const mockBreadcrumbs = [
  { label: "Home", url: "/" },
  { label: "Blog", url: "/blog" },
  { label: "Fitness", url: "/blog/fitness" },
  { label: "Test Post", url: "/blog/fitness/test-post" },
];

console.log("✅ Testing BlogPosting schema generation...");
try {
  const postingSchema = generateBlogPostingSchema(mockPost, {
    baseUrl: "https://spartanclub.co",
    siteName: "Spartan Club",
    siteImage: "https://spartanclub.co/og-image.png",
  });
  console.log("✓ BlogPosting schema valid");
  console.log(JSON.stringify(postingSchema, null, 2).substring(0, 200) + "...\n");
} catch (error) {
  console.error("✗ BlogPosting schema error:", error);
}

console.log("✅ Testing CollectionPage schema generation...");
try {
  const collectionSchema = generateCollectionPageSchema(
    mockPost.category,
    [mockPost],
    {
      baseUrl: "https://spartanclub.co",
      siteName: "Spartan Club",
    }
  );
  console.log("✓ CollectionPage schema valid");
  console.log(JSON.stringify(collectionSchema, null, 2).substring(0, 200) + "...\n");
} catch (error) {
  console.error("✗ CollectionPage schema error:", error);
}

console.log("✅ Testing Breadcrumb schema generation...");
try {
  const breadcrumbSchema = generateBreadcrumbSchema(mockBreadcrumbs, {
    baseUrl: "https://spartanclub.co",
  });
  console.log("✓ Breadcrumb schema valid");
  console.log(JSON.stringify(breadcrumbSchema, null, 2).substring(0, 200) + "...\n");
} catch (error) {
  console.error("✗ Breadcrumb schema error:", error);
}

console.log("✅ All schema tests completed!");
