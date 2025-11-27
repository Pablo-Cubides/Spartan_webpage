import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const COMMENTS_PATHS = [
  path.resolve(process.cwd(), "data", "comments.json"),
  path.resolve(process.cwd(), "frontend", "data", "comments.json"),
  path.resolve(process.cwd(), "../frontend", "data", "comments.json"),
];

function findWritablePath() {
  for (const p of COMMENTS_PATHS) {
    const dir = path.dirname(p);
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({ comments: [] }, null, 2));
      return p;
    } catch {
      // continue
    }
  }
  // fallback to temp
  return path.resolve(process.cwd(), "comments.json");
}

const COMMENTS_FILE = findWritablePath();

type Comment = {
  id: string;
  postSlug: string;
  name?: string;
  content: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

function readComments(): { comments: Comment[] } {
  try {
    const raw = fs.readFileSync(COMMENTS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { comments: [] };
  }
}

function writeComments(data: { comments: Comment[] }) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const post = url.searchParams.get("post");
  const data = readComments();
  const approved = data.comments.filter((c) => c.status === "approved" && (!post || c.postSlug === post));
  return NextResponse.json({ comments: approved });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postSlug, name, content } = body;
    if (!postSlug || !content) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const data = readComments();
    const comment: Comment = { id: uuidv4(), postSlug, name: name || undefined, content, createdAt: new Date().toISOString(), status: "pending" };
    data.comments.unshift(comment);
    writeComments(data);
    return NextResponse.json({ ok: true, comment });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  // moderation action: expects { id, action: 'approve'|'reject' } and header x-admin-token
  const adminToken = process.env.COMMENTS_ADMIN_TOKEN || "";
  const provided = request.headers.get("x-admin-token") || "";
  if (!adminToken || provided !== adminToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { id, action } = body;
    if (!id || !["approve", "reject"].includes(action)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const data = readComments();
    const idx = data.comments.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    data.comments[idx].status = action === "approve" ? "approved" : "rejected";
    writeComments(data);
    return NextResponse.json({ ok: true, comment: data.comments[idx] });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
