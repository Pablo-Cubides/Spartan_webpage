
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function GET(request: Request) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        is_published: true,
        published_at: {
          lte: new Date(),
        },
      },
      orderBy: { published_at: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        cover_image: true,
        published_at: true,
        author: {
          select: { name: true },
        },
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching public posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
