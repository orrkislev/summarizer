import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const origText = req.body.text
    const targetWords = Math.round(origText.split(' ').length / 3)

    let prompt = `summarize this paragraph in up to ${targetWords} words and Don't use 'this text' in the opening.`
    prompt += `Use this context to summarize it: the paragraph which immediately precedes it reads: "${prev}". `
    prompt += `The paragraph which immediately follows it reads: "${next}". the text to summarize is: "${origText}"`

    // use chatGPT to generate a response, use ChatCompletion
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": prompt },
        ]
    });


    const text = response.data.choices[0].message.content
    res.status(200).json({ text })
}