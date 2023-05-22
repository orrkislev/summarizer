import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    let targetWords = Math.round(req.body.target)

    let prompt = `Summarize this in up to ${targetWords} words:` + req.body.text + ` /n`
    if (req.body.before) prompt += `The paragraph which immediately precedes it reads: "${req.body.before}". `
    if (req.body.after) prompt += `The paragraph which immediately follows it reads: "${req.body.after}". `

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": "You Summarize paragraphs from a book. give me only the summary and nothing else, dont respond with 'this paragraph'." },
            { "role": "user", "content":  prompt },
        ]
    });

    let answer = response.data.choices[0].message.content
    res.status(200).json({ text: answer })
}