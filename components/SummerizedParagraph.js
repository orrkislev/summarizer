import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const SummaryContainer = styled.div`
    position: absolute;
    background: #ffffffdd;
    backdrop-filter: blur(1px);
    font-family: 'Roboto', sans-serif;
    line-height: 1.5em;
    font-weight: 600;
    font-size: 1.5em;
    `

// side text is the gist, vertical text on the right side, in italics, no wrapping, classical serif font
const SideText = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    font-size: 13px;
    font-style: italic;
    color: cornflowerblue;
    font-family: 'Times New Roman', serif;
    white-space: nowrap;
    font-weight: 300;
    `

const Dot = styled.div`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #40E0D0;
    transition: all 0.2s ease-in-out;
    `


export default function SummerizedParagraphs(props) {
    const ref = useRef(null)
    const [summary, setSummary] = useState("")
    const [sideText, setSideText] = useState("")
    const [lineHeight, setLineHeight] = useState(30)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (visible && summary === "") {
            getSummary()
        }
    }, [visible])

    const getSummary = async () => {
        if (summary !== "") return
        setSummary('...')
        const res = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: props.paragraph.innerText, 
                html: props.paragraph.innerHTML,
                prev: props.prev,
                next: props.next
            })
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

    // if (!props.visible) return null

    return (
        <>
        <Dot style={{top: style.top, left: style.left-30}} onClick={() => setVisible(!visible)} />
        {visible && 
            <SummaryContainer style={style} onMouseEnter={props.onMouseEnter}>
                <div style={{ padding: '1em' }} ref={ref}  dangerouslySetInnerHTML={{ __html: summary }} />
                <SideText> {sideText} </SideText>
            </SummaryContainer>
        }
        </>
    )
}