import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const origText = req.body.text
    const targetWords = Math.round(origText.split(' ').length / 3)

    // use chatGPT to generate a response, use ChatCompletion
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": `write a summary of this text, in up to ${targetWords} words. Don't use 'this text' in the opening :` + origText },
        ]
    });


    const text = response.data.choices[0].message.content
    res.status(200).json({ text })
}