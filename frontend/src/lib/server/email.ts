const BREVO_API_KEY = process.env.BREVO_API_KEY

export async function sendTemplateEmail(to: string, templateId: number, params: Record<string, unknown>) {
  if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY not configured')

  const payload = {
    to: [{ email: to }],
    templateId,
    params,
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Brevo send failed: ${res.status} ${text}`)
  }
  return res.json()
}

export default sendTemplateEmail
