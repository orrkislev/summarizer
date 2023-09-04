export async function getStreamWords(fetchRes, onWord = () => { }, onDone = () => { }) {
    const reader = fetchRes.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;


        // const chunk = decoder.decode(value);
        // const lines = chunk.split("\\n");
        // const parsedLines = lines
        //     .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
        //     .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        //     .map((line) => JSON.parse(line)); // Parse the JSON string

        // for (const parsedLine of parsedLines) {
        //     const { choices } = parsedLine;
        //     const { delta } = choices[0];
        //     const { content } = delta;
        //     if (content) {
        //         onWord(content);
        //     }
        // }

        const txt = decoder.decode(value)
        console.log('------- new chunk -------')
        console.log('decoded -', txt)
        const txts = txt.split('\n').filter(x => x.startsWith('data:'))
        console.log('txts -', txts)
        txts.forEach(t => {
            console.log('t -', t)
            t = t.slice(6)
            console.log('t sliced -', t)
            if (t == '[DONE]') return;

            const json = JSON.parse(t);
            const content = json.choices[0].delta.content;
            if (content) onWord(content);
        })
    }
    onDone()
}