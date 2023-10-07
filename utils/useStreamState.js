import { useState } from "react";

export default function useStreamState(def = "", onFinished = () => { }) {
    const [data, set] = useState(def)

    const get = async (fetchRes) => {
        getStreamWords(fetchRes,
            (word) => {
                set(data + word)
            },
            () => {
                onFinished()
            })
    }

    return {data, get, set}
}


export async function getStreamWords(fetchRes, onWord = () => { }, onDone = () => { }) {
    const reader = fetchRes.body.getReader();
    const decoder = new TextDecoder();
    let lastPartlyJson = null
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const txt = decoder.decode(value)
        const txts = txt.split('\n').filter(t => t.length > 0).map(t => t.slice(6))
        if (lastPartlyJson) {
            txts[0] = lastPartlyJson + txts[0]
            lastPartlyJson = null
        }
        txts.forEach(t => {
            if (t == '[DONE]') return;

            try {
                const json = JSON.parse(t);
                const content = json.choices[0].delta.content;
                if (content) onWord(content);

            } catch (e) {
                lastPartlyJson = t
            }
        })
    }
    onDone()
}