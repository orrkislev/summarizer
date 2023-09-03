import { Configuration, OpenAIApi } from 'openai-edge'
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req) {
    const body = await req.json()

    const action = body.action

    let prompt = `Summarize this paragraph: ${body.text} /n`
    if (body.before) prompt += `The paragraph which immediately precedes it reads: ${body.before}. /n`
    if (body.after) prompt += `The paragraph which immediately follows it reads: ${body.after}. /n`

    if (action == 'new') {
        const targetWords = Math.round(body.text.split(' ').length / 3)
        prompt += `Summarize the paragraph above in ${targetWords} words.`

        prompt += 'format your response like this: /n'
        prompt += 'GIST: [shorter, up to 5 words] /n'
        prompt += 'SUMMARY: [your summary] /n'
    }
    if (action == 'shorter') {
        prompt = `make this text a bit shorter: ${body.current}`
    }
    if (action == 'longer') {
        prompt += `The Current Summary is this: ${body.current} /n`
        prompt += `Summarize the paragraph above in more words.`
    }

    const model = body.use4 ? 'gpt-4' : 'gpt-3.5-turbo'

    const completion = await openai.createChatCompletion({
        model,
        stream: true,
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "You Summarize paragraphs from a book. give me only the summary and nothing else, dont respond with 'this paragraph','the author','this book', etc." },
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

