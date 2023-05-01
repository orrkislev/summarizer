import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const targetWords = Math.round(req.body.text.split(' ').length / 3)

    // let prompt = `summarize this paragraph in up to ${targetWords} words and Don't use 'this text' in the opening.`
    // prompt += `Use this context to summarize it: the paragraph which immediately precedes it reads: "${prev}". `
    // prompt += `The paragraph which immediately follows it reads: "${next}". the text to summarize is: "${origText}"`

    // let prompt = `summarize this paragraph in up to ${targetWords}: /n/n "${origText}" /n/n summary:`


    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": "Summarize paragraphs from a book. they may contain html tags - please use the respected tags in the summary too. give me only the summary and nothing else." },
            { "role": "user", "content": "format your answer like this: summary:(summary), gist: (maximum 3 words)" },
            { "role": "user", "content": `Summarize this in up to ${targetWords} words:` + req.body.html },
        ]
    });

    let answer = response.data.choices[0].message.content
    answer = answer.replace('Gist:', 'gist:').replace('Summary:', 'summary:')
    const summary = answer.split('summary:')[1].split('gist:')[0]
    const gist = answer.split('gist:')[1]
    res.status(200).json({ text: summary, gist })
}