import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-gzh45Pniv0JAwz5DfTMchndW",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
    const prompt = `${req.body.text} \n \n TL:DR \n`

    const completion = await openai.createCompletion("text-davinci-002", {
        prompt: prompt,
        temperature: 0.6,
        max_tokens: Math.round(req.body.text.length*1.33 * 0.5),
    });

    console.log(completion)
    console.log(completion.data)

    res.status(200).json({ result: completion.data.choices[0].text });
}
