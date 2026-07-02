// Vercel serverless function: POST /api/analyze
// The Anthropic API key lives ONLY here (server-side env var), so it never
// ships in the browser bundle. The client sends structured skin-log data;
// this endpoint builds the prompt and calls Claude. Because the prompt is
// constructed here, the endpoint can only ever do skin analysis — nobody can
// repurpose your key as a free general-purpose Claude proxy.
import Anthropic from '@anthropic-ai/sdk'

// Switch this one line to change models. Opus 4.7 = highest quality, most
// accurate vision. 'claude-sonnet-4-6' = cheaper and still excellent at vision.
const MODEL = 'claude-opus-4-8'
const MAX_TOKENS = 1500

const SYSTEM_PROMPT = `You are an expert, caring skincare analyst reviewing a person's daily progress photo. Think of the warmest, most knowledgeable specialist in a high-end dermatology clinic — deeply observant and genuinely encouraging. You are NOT a salesperson and NOT a doctor.

You assess only what is genuinely VISIBLE in the photo. You describe — you never diagnose. Where a dimension isn't visible or the photo is unclear, you say so kindly rather than inventing detail.

== WHAT TO ASSESS (only where visible) ==

SKIN CLARITY & BLEMISHES:
- Describe visible blemishes in plain, non-clinical language: surface spots, congested/clogged areas, redness spots, post-blemish marks (dark spots left behind).
- Give approximate density only — "a few" / "several" / "clustered in one area". NEVER an exact, alarming count.
- General location: forehead / cheeks / chin / nose / jawline.
- Whether things look calmer or more active than the previous photo.
- Do NOT diagnose acne grade, cystic conditions, or any medical condition. If something looks inflamed, painful, or persistent, gently suggest a dermatologist instead of labelling it.

TEXTURE & PORES: smoothness vs roughness; visible congestion or uneven areas; pore appearance in T-zone vs cheeks.
TONE & PIGMENTATION: evenness of overall tone; areas of redness; post-blemish marks / darker patches and whether they appear to be fading across photos.
HYDRATION & BARRIER: dryness, flaking, tightness; dehydration vs healthy moisture; any signs of over-exfoliation or an irritated barrier (redness, sensitivity) — flag gently.
OIL & SHINE: T-zone oiliness; balanced vs oily vs dry zones (combination mapping).
RADIANCE: overall glow and healthy appearance; comparison to previous photos.

== ADVICE ENGINE ==

WHAT'S WORKING: based on what's visible AND the products they logged, what seems to be helping. If a recently added product correlates with signs of irritation, gently raise it as something to consider easing off.
TARGETED TIPS: 2-3 specific, actionable tips for what's visible today. Plain-language ingredient education is welcome (e.g. "ingredients like niacinamide are often used to even out tone") — educational, never prescriptive. Encourage SPF, hydration, sleep where relevant.
WATCH THIS: one thing to keep a gentle eye on over the next few days, in calm language.
SEE A PRO: if anything looks persistent, painful, spreading, or simply isn't improving over multiple entries, include a gentle, caring recommendation to see a dermatologist — framed as "a derm could give you something more targeted for this", never as something scary. Otherwise this is null.

== TONE RULES (CRITICAL) ==
- Always lead with something genuinely positive (encouragement_opener) and always end on an encouraging note (closing).
- Warm and human, never clinical or cold.
- NEVER use alarming words: avoid "severe", "bad", "concerning", "outbreak", "breakout". Use gentle framing.
- Never diagnose medical conditions. Never guarantee results.
- For the "Mama" profile (an older adult): extra warmth and respect; focus on radiance, hydration, and tone; treat mature skin with care and never imply anything critical about ageing.
- If the photo is too low-quality to assess fairly, say so kindly in photo_quality_note and ask for a clearer one rather than guessing — and keep scores gentle/neutral rather than inventing detail.

== SCORING ==
overall_score is 0–10 (one decimal allowed). Be consistent day to day; do not swing on photo noise. trend is relative to the previous photo/week.

== OUTPUT ==
Return ONLY raw JSON — no markdown, no code fences, no text before or after. Use this EXACT shape (every key present; use null or an empty array where you have nothing to say, except see_a_pro which is null unless warranted):
{
  "overall_score": number,
  "trend": "improving" | "stable" | "declining",
  "encouragement_opener": string,
  "clarity": { "summary": string, "areas": [string], "activity_level": string },
  "texture": string,
  "tone": string,
  "hydration": string,
  "oil_balance": string,
  "radiance": string,
  "whats_working": string,
  "targeted_tips": [string],
  "ingredient_note": string,
  "watch_this": string,
  "see_a_pro": string | null,
  "photo_quality_note": string,
  "closing": string,
  "disclaimer": string
}`

function imageBlock(dataUrl) {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl || '')
  if (!match) return null
  return {
    type: 'image',
    source: { type: 'base64', media_type: match[1], data: match[2] },
  }
}

function parseAnalysis(raw) {
  let text = raw
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text)
  if (fence) text = fence[1].trim()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Claude returned something that was not valid JSON:\n\n' + raw)
  }
}

// Guarantee a complete, well-typed object so the UI never breaks on a missing
// or malformed field, whatever the model returns.
function normalizeAnalysis(a) {
  const obj = a && typeof a === 'object' ? a : {}
  const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : [])
  const num = (v) => {
    const n = Number(v)
    if (Number.isNaN(n)) return null
    return Math.max(0, Math.min(10, n))
  }
  const trend = ['improving', 'stable', 'declining'].includes(obj.trend) ? obj.trend : 'stable'
  const rawClarity = obj.clarity && typeof obj.clarity === 'object' ? obj.clarity : {}

  return {
    overall_score: num(obj.overall_score),
    trend,
    encouragement_opener: str(obj.encouragement_opener),
    clarity: {
      summary: str(rawClarity.summary),
      areas: arr(rawClarity.areas),
      activity_level: str(rawClarity.activity_level),
    },
    texture: str(obj.texture),
    tone: str(obj.tone),
    hydration: str(obj.hydration),
    oil_balance: str(obj.oil_balance),
    radiance: str(obj.radiance),
    whats_working: str(obj.whats_working),
    targeted_tips: arr(obj.targeted_tips),
    ingredient_note: str(obj.ingredient_note),
    watch_this: str(obj.watch_this),
    see_a_pro: str(obj.see_a_pro), // null unless the model flagged something
    photo_quality_note: str(obj.photo_quality_note),
    closing: str(obj.closing),
    disclaimer:
      str(obj.disclaimer) ||
      'This is general skincare guidance, not medical advice. For persistent or painful concerns, a dermatologist can help.',
  }
}

// Core logic, shared by the Vercel handler (prod) and the Vite dev plugin (local).
export async function handleAnalyze(body, apiKey) {
  const {
    profileName,
    profileRole,
    isMama,
    todayPhoto,
    yesterdayPhoto,
    skinFeel,
    note,
    recentContext,
    previousSummary,
  } = body || {}

  const client = new Anthropic({ apiKey })
  const content = []

  const todayImg = imageBlock(todayPhoto)
  if (!todayImg) throw new Error("Today's photo is missing or invalid.")
  content.push({ type: 'text', text: "TODAY's progress photo:" })
  content.push(todayImg)

  const yImg = yesterdayPhoto ? imageBlock(yesterdayPhoto) : null
  if (yImg) {
    content.push({ type: 'text', text: "YESTERDAY's progress photo (for comparison):" })
    content.push(yImg)
  } else {
    content.push({ type: 'text', text: 'No yesterday photo is available for comparison.' })
  }

  content.push({
    type: 'text',
    text: [
      `Profile: ${profileName} (${profileRole}).${isMama ? ' Apply the special "Mama" handling.' : ''}`,
      `Skin feel today: ${skinFeel || 'not noted'}.`,
      `Note from today: ${note ? `"${note}"` : 'none'}.`,
      '',
      'Past 7 days of products and skin feel:',
      recentContext || 'No prior logs.',
      '',
      previousSummary || 'No previous analysis on record.',
      '',
      "Analyse TODAY's photo now and return the JSON exactly as specified.",
    ].join('\n'),
  })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content }],
  })

  const raw = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  return normalizeAnalysis(parseAnalysis(raw))
}

// Vercel entry point.
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
    const analysis = await handleAnalyze(req.body, apiKey)
    res.status(200).json({ analysis })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Analysis failed.' })
  }
}
