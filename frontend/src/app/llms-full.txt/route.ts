import { buildLlmsTxt } from "@/lib/seo/llms";

export const revalidate = 3600;

export async function GET() {
  return new Response(await buildLlmsTxt({ full: true }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
