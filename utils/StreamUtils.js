export async function getStreamWords(fetchRes, onWord = () => { }, onDone = () => { }) {
    const reader = fetchRes.body.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const txt = new TextDecoder().decode(value)

        const txts = txt.split('\n').filter(x => x.startsWith('data:'))
        txts.forEach(t => {
            t = t.slice(6)
            if (t == '[DONE]') return;

            const json = JSON.parse(t);
            const content = json.choices[0].delta.content;
            console.log(content)
            if (content) onWord(content);
        })
    }
    onDone()
}