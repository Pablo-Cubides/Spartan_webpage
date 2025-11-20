const REST_URL = process.env.REDIS_REST_URL
const REST_TOKEN = process.env.REDIS_REST_TOKEN

if (!REST_URL || !REST_TOKEN) {
  // not initialized; functions should handle missing env gracefully
}

export async function upstashGet(key: string) {
  const res = await fetch(`${REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.result ?? null
}

export async function upstashSet(key: string, value: string, ttl = 3600) {
  // value should be stringified if complex
  await fetch(`${REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/EX/${ttl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
  })
}

export default { upstashGet, upstashSet }
