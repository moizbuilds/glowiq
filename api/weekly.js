// Vercel serverless function: POST /api/weekly
// Generates a warm, personalised weekly skin report from the week's logs.
// Like /api/analyze, the API key lives only here and the prompt is built
// server-side so the endpoint can only ever write skin reports.
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-4-7'
const MAX_TOKENS = 900

const SYSTEM_PROMPT = `You are a caring skincare specialist writing a client's WEEKLY skin report. You receive a digest of their past week of daily logs (scores, skin feel, products, observations, photo-quality notes) and the previous week's average score for comparison.

Write an encouraging, specific, honest report. Celebrate consistency. Be realistic — skin changes slowly. Never diagnose conditions or recommend medications; if something seems to need a professional, gently suggest a dermatologist.

Use the provided opening_line verbatim as the "opening" field.

Output ONLY raw JSON — no markdown, no code fences. Match this shape exactly:
{
  "opening": string,
  "summary": string,
  "star_product": string,
  "reconsider_product": string,
  "recommendation": string,
  "photo_consistency_score": number,
  "week_vs_last_week": string,
  "highlight": string
}
Notes:
- photo_consistency_score is 0–100 (how comparable the week's photos were).
- star_product / reconsider_product: use a real product name from the digest, or "Not enough data yet" if unclear. Never invent products.
- Keep each string to 1–2 sentences.`

function parse(raw) {
  let text = raw
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text)
  if (fence) text = fence[1].trim()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Claude returned invalid JSON:\n\n' + raw)
  }
}

export async function handleWeekly(body, apiKey) {
  const { profileName, profileRole, isMama, openingLine, digest, lastWeekAvg } = body || {}
  const client = new Anthropic({ apiKey })

  const text = [
    `Client: ${profileName} (${profileRole}).${isMama ? ' Apply especially warm, respectful language and weight hydration & radiance more heavily.' : ''}`,
    `opening_line to use verbatim: "${openingLine}"`,
    lastWeekAvg != null ? `Previous week average score: ${lastWeekAvg}/10.` : 'No previous week to compare against.',
    '',
    "This week's daily digest:",
    digest || 'No entries.',
    '',
    'Write the weekly report JSON now.',
  ].join('\n')

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: [{ type: 'text', text }] }],
  })

  const raw = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  return parse(raw)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' })
    return
  }
  try {
    const report = await handleWeekly(req.body, apiKey)
    res.status(200).json({ report })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Weekly report failed.' })
  }
}
