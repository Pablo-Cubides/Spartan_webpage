
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if published
    const isPublished = post.is_published && post.published_at && new Date(post.published_at) <= new Date();

    if (!isPublished) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching public post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
