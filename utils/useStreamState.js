import { useState } from "react";

export default function useStreamState(def = "", onFinished = () => { }) {
    const [state, set] = useState(def)

    const get = async (fetchRes) => {
        const reader = fetchRes.body.getReader();
        let newResult = '';
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
                if (content) {
                    newResult += content;
                    set(newResult);
                }
            })
        }
        onFinished(newResult)
    }

    return [state, get, set]
}