import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const SummaryContainer = styled.div`
    font-family: 'CrimsonText';
    color: mediumvioletred;
    line-height: 1.3em;
    font-weight: 600;
    font-size: 1.1em;
    display: flex;
    flex-direction: column;
    gap: 0em;
    padding-left: 1em;
    `

// side text is the gist, vertical text on the right side, in italics, no wrapping, classical serif font
const SideText = styled.div`
    top: 0;
    left: 0;
    font-size: 13px;
    font-style: italic;
    color: cornflowerblue;
    white-space: nowrap;
    font-weight: 300;
    `

const Dot = styled.div`
    padding: 0.5em;
    font-size: 0.8rem;
    color: royalblue;
    border-radius: 0.5em;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    &:hover {
        color: white;
        background: royalblue;
    }
    `


export default function SummerizedParagraphs(props) {
    const ref = useRef(null)
    const [summary, setSummary] = useState("")
    const [sideText, setSideText] = useState("")
    const [visible, setVisible] = useState(false)

    useEffect(()=>{
        if (props.visible) setVisible(true)
    }, [props.visible])

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
    const top = element.offsetTop + props.offsetTop + 10
    const left = props.offsetLeft + 30

    return (
        <div style={{position:'absolute',top, left, width:'15em'}}>
            <Dot onClick={() => setVisible(!visible)} > 
            {visible ? 'Regenerate' : 'Generate'}
            </Dot>
            {visible && 
                <SummaryContainer onMouseEnter={props.onMouseEnter}>
                    <SideText> {sideText} </SideText>
                    <div ref={ref}  dangerouslySetInnerHTML={{ __html: summary }} />
                </SummaryContainer>
            }
        </div>
    )
}