import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const SummaryContainer = styled.div`
    position: absolute;
    background: #ffffffdd;
    backdrop-filter: blur(1px);
    font-family: 'Roboto', sans-serif;
    line-height: 1.5em;
    font-weight: 600;
    `

// side text is the gist, vertical text on the right side, in italics, no wrapping, classical serif font
const SideText = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    font-size: 0.8em;
    font-style: italic;
    color: cornflowerblue;
    font-family: 'Times New Roman', serif;
    white-space: nowrap;
    line-height: 1em;
    font-weight: 300;
    `



export default function SummerizedParagraphs(props) {
    const ref = useRef(null)
    const [summary, setSummary] = useState("")
    const [sideText, setSideText] = useState("")
    const [lineHeight, setLineHeight] = useState(30)

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

    // useEffect(()=>{
    //     if (ref.current) {
    //         const height = ref.current.offsetHeight
    //         if (Math.abs(height - element.offsetHeight) < 10) return
    //         const heightOnlyText = height - 16
    //         const lines = heightOnlyText / lineHeight
    //         if (lines > 1) {
    //             const targetLineHeight = (element.offsetHeight - 16) / lines
    //             setLineHeight(targetLineHeight)
    //         }
    //     }
    // })

    if (!props.visible) return null

    return (
        <SummaryContainer style={style} onMouseEnter={props.onMouseEnter}>
            <div style={{ padding: '1em' }} ref={ref}  dangerouslySetInnerHTML={{ __html: summary }} />
            {/* <div style={{ padding: '8px' }} ref={ref}> {summary} </div> */}
            <SideText> {sideText} </SideText>
        </SummaryContainer>
    )
}