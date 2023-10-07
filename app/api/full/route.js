import { Configuration, OpenAIApi } from 'openai-edge'
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req) {
    const body = await req.json()

    let prompt = `Summarize this text, paragraph by paragraph: ${body.text} /n`
    prompt += 'format your response like this: /n'
    prompt += 'paragraph 1: [your summary of paragraph 1] /n'
    prompt += 'paragraph 2: [your summary of paragraph 2] /n'
    prompt += 'etc. /n'

    const model = body.use4 ? 'gpt-4' : 'gpt-3.5-turbo'

    const completion = await openai.createChatCompletion({
        model,
        stream: true,
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `You Summarize paragraphs from a non-fiction book. Please don't use indirect speech in your summary - no "the passage", "the author", "the paragraph" or "this" at the start of your summary. Please don't use colon in your title.` },
            { role: "user", content: prompt },
        ],
    });

    return new Response(completion.body, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/event-stream;charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    })
}

