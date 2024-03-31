import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API });

export const runtime = 'edge'

export async function POST(req) {
    const body = await req.json()

    const action = body.action

    let prompt = `You Summarize paragraphs from a non-fiction book. Please don't use indirect speech in your summary - no "the passage", "the author", "the paragraph" or "this" at the start of your summary. Please don't use colon in your title. /n`
    prompt += `Summarize this paragraph: ${body.text} /n`
    if (body.before) prompt += `The paragraph which immediately precedes it reads: ${body.before}. /n`
    if (body.after) prompt += `The paragraph which immediately follows it reads: ${body.after}. /n`
    if (body.lastSummary) prompt += `The summary of the previous paragraph was ${body.lastSummary}. Please make sure that the new summary continues the previous summary.`

    if (action == 'new') {
        const targetWords = Math.round(body.text.split(' ').length / 3)
        prompt += `Summarize the paragraph above in ${targetWords} words.`

        prompt += 'format your response like this: /n'
        prompt += 'TITLE: [very brief, 5 words] /n'
        prompt += 'SUMMARY: [your full summary] /n'
    }
    if (action == 'shorter') {
        // prompt = `make this text a bit shorter: ${body.current}`
        prompt += `The Current Summary is this: ${body.current} /n`
        prompt += `Summarize the paragraph above in fewer words.`
    }
    if (action == 'longer') {
        prompt += `The Current Summary is this: ${body.current} /n`
        prompt += `Summarize the paragraph above in more words.`
    }

    const claude = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
            { role: "user", content: prompt },
        ]
    });

    return new Response(claude.content[0].text, {
        headers: { 'Content-Type': 'text/plain' },
    });
}

