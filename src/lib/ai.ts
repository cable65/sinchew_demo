
import OpenAI from 'openai'

const PREFERRED_AI = process.env.PREFERRED_AI || 'deepseek'

function getClient() {
  if (PREFERRED_AI === 'openai') {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  } else {
    // DeepSeek configuration
    return new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    })
  }
}

const client = getClient()
const MODEL = PREFERRED_AI === 'openai' ? 'gpt-4o' : 'deepseek-chat'

export async function generateSeoSuggestions(title: string, content: string) {
  const prompt = `
    Analyze the following article content and generate SEO metadata.
    Return the response in JSON format with the following keys:
    - seoTitle: An optimized SEO title (max 60 chars)
    - seoDescription: A compelling meta description (max 160 chars)
    - seoKeywords: A comma-separated string of 5-8 relevant keywords
    
    Article Title: ${title}
    
    Article Content (first 3000 chars):
    ${content.slice(0, 3000)}
  `

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are an SEO expert assistant. You always respond in valid JSON." },
      { role: "user", content: prompt }
    ],
    model: MODEL,
    response_format: { type: "json_object" }
  })

  try {
    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result
  } catch (e) {
    console.error('Failed to parse AI response', e)
    throw new Error('AI response parsing failed')
  }
}

export async function checkGrammar(content: string) {
  const prompt = `
    Proofread the following HTML content (English/Chinese).
    Identify grammar errors, typos, and awkward phrasing.
    
    IMPORTANT: 
    1. The input is HTML. The "original" and "suggestion" fields MUST be exact HTML snippets from the source so they can be programmatically replaced.
    2. Do NOT change HTML tags unless the tag itself is incorrect.
    3. If the error spans multiple tags, include the full tags in "original" and "suggestion".
    
    Return the response in JSON format with the following structure:
    {
      "issues": [
        {
          "original": "exact html snippet with error",
          "suggestion": "corrected html snippet",
          "reason": "explanation of the error",
          "severity": "critical" | "suggestion"
        }
      ],
      "summary": "A brief summary of the text quality"
    }
    
    If there are no issues, return an empty "issues" array.
    
    HTML Content to check (first 4000 chars):
    ${content.slice(0, 4000)}
  `

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are a professional editor. You verify HTML content and return JSON." },
      { role: "user", content: prompt }
    ],
    model: MODEL,
    response_format: { type: "json_object" }
  })

  try {
    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result
  } catch (e) {
    console.error('Failed to parse AI response', e)
    throw new Error('AI response parsing failed')
  }
}
