import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const PATHS = [
  path.resolve(process.cwd(), 'data', 'newsletter.json'),
  path.resolve(process.cwd(), 'frontend', 'data', 'newsletter.json'),
  path.resolve(process.cwd(), '../frontend', 'data', 'newsletter.json'),
];

function findWritablePath() {
  for (const p of PATHS) {
    const dir = path.dirname(p);
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({ subscribers: [] }, null, 2));
      return p;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // continue
    }
  }
  return path.resolve(process.cwd(), 'newsletter.json');
}

const FILE = findWritablePath();

type Subscriber = { id: string; email: string; createdAt: string };

function readFile(): { subscribers: Subscriber[] } {
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(raw);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return { subscribers: [] };
  }
}

function writeFile(data: { subscribers: Subscriber[] }) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email || !validEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    const data = readFile();
    if (data.subscribers.find((s) => s.email === email)) {
      return NextResponse.json({ ok: true, already: true });
    }

    const sub: Subscriber = { id: uuidv4(), email, createdAt: new Date().toISOString() };
    data.subscribers.unshift(sub);
    writeFile(data);
    return NextResponse.json({ ok: true, subscriber: sub });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function GET() {
  const data = readFile();
  return NextResponse.json({ subscribers: data.subscribers.map((s) => ({ email: s.email, createdAt: s.createdAt })) });
}
