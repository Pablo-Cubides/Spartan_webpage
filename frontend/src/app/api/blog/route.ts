import { NextResponse, NextRequest } from "next/server";
import { withErrorHandler, ValidationError } from "@/lib/api/error-handler";
import { getPublicBlogArticles } from "@/lib/blog/service";

const getHandler = async (request: NextRequest) => {
  // Extract query params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const category = searchParams.get("category") || undefined;

  // Validate pagination params
  if (isNaN(page) || page < 1) {
    throw new ValidationError("Invalid page parameter", {
      page: "Must be >= 1",
    });
  }
  if (isNaN(limit) || limit < 1 || limit > 50) {
    throw new ValidationError("Invalid limit parameter", {
      limit: "Must be between 1 and 50",
    });
  }

  const allPosts = await getPublicBlogArticles(category);
  const total = allPosts.length;
  const skip = (page - 1) * limit;
  const paginated = allPosts.slice(skip, skip + limit);

  const posts = paginated.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    cover_image: p.cover_image,
    published_at: p.published_at,
    category_slug: p.category_slug,
    category_name: p.category_name,
    author: { name: p.author.name },
  }));

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  });
};

export const GET = withErrorHandler(getHandler);
