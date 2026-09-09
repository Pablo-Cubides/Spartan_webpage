import { NextResponse, NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/server/auth";
import { CreateBlogPostSchema } from "@/lib/validation/schemas";
import {
  withErrorHandler,
  AuthorizationError,
  ValidationError,
  parseJsonBody,
} from "@/lib/api/error-handler";
import { getAllUnifiedArticles, createBlogArticle } from "@/lib/blog/service";

const getHandler = async (request: NextRequest) => {
  const user = await verifyAdmin(request);
  if (!user) {
    throw new AuthorizationError("Admin access required");
  }

  // Extract pagination params from query string
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  if (isNaN(page) || page < 1) {
    throw new ValidationError("Invalid page parameter", {
      page: "Must be >= 1",
    });
  }
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError("Invalid limit parameter", {
      limit: "Must be between 1 and 100",
    });
  }

  const all = await getAllUnifiedArticles();
  const total = all.length;
  const skip = (page - 1) * limit;
  const posts = all.slice(skip, skip + limit);

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

const postHandler = async (request: NextRequest) => {
  const user = await verifyAdmin(request);
  if (!user) {
    throw new AuthorizationError("Admin access required");
  }

  const body = await parseJsonBody<Record<string, unknown>>(
    request,
    CreateBlogPostSchema,
  );
  const {
    title,
    slug,
    content,
    excerpt,
    cover_image,
    is_published,
    published_at,
  } = body;

  const created = await createBlogArticle({
    title: title as string,
    slug: slug as string,
    content: content as string,
    excerpt: excerpt as string | undefined,
    cover_image: cover_image as string | undefined,
    status: is_published ? "published" : "paused",
    published_at: published_at as string | undefined,
    source: "manual",
    author_name: user.name || "Admin Triarvon",
  });

  return NextResponse.json(created);
};

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
