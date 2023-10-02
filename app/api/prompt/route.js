import { Configuration, OpenAIApi } from 'openai-edge'
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req) {
    const body = await req.json()
    const prompt = `${body.propmt} /n`

    const model = 'gpt-4'

    const completion = await openai.createChatCompletion({
        model,
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
        ],
    });

    const answer = completion.data.choices[0].message.content
    return new Response(answer, {
        headers: { 'content-type': 'text/plain' },
    })
}

