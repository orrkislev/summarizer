import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const SummaryContainer = styled.div`
    position: absolute;
    background: #ffffffcc;
    backdrop-filter: blur(1px);
    font-family: 'Roboto', sans-serif;
    line-height: 1.5em;
    `

// side text is the gist, vertical text on the right side, in italics, no wrapping
const SideText = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(100%, 0);
    height: 100%;
    writing-mode: vertical-rl;
    font-size: 0.8em;
    font-style: italic;
    color: cornflowerblue;
    white-space: nowrap;
    `



export default function SummerizedParagraphs(props) {
    const ref = useRef(null)
    const [summary, setSummary] = useState("")
    const [sideText, setSideText] = useState("")
    const [lineHeight, setLineHeight] = useState(10)

    useEffect(() => {
        getSummary()
    }, [])

    const getSummary = async () => {
        if (summary !== "") return
        setSummary('...')
        const res = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: props.paragraph.innerText, html: props.paragraph.innerHTML })
        })
        const { text, gist } = await res.json()
        setSummary(text)
        setSideText(gist)
    }


    const element = props.paragraph
    const style = {
        width: element.offsetWidth,
        height: element.offsetHeight,
        top: element.offsetTop + props.offsetTop + 10,
        left: element.offsetLeft + props.offsetLeft + 10,
        lineHeight: lineHeight + 'px'
    }

    setTimeout(() => {
        if (ref.current) {
            const height = ref.current.offsetHeight
            if (Math.abs(height - element.offsetHeight) < 10) return
            const heightOnlyText = height - 16
            const lines = heightOnlyText / lineHeight
            if (lines > 1) {
                const targetLineHeight = (element.offsetHeight - 16) / lines
                setLineHeight(targetLineHeight)
            }
        }
    }, 300)

    if (!props.visible) return null

    return (
        <SummaryContainer style={style} onMouseEnter={props.onMouseEnter}>
            {/* <div style={{ padding: '1em' }}  dangerouslySetInnerHTML={{ __html: summary }} /> */}
            <div style={{ padding: '8px' }} ref={ref}> {summary} </div>
            <SideText> {sideText} </SideText>
        </SummaryContainer>
    )
}