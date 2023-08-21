import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const SummaryContainer = styled.div`
    // font-family: 'CrimsonText';
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
    const GPTButtons = styled.div`
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    margin-top: 0.5em;
    font-size: 0.8rem;
    `
const GPTButton = styled.div`
    color: royalblue;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.5em;
    padding: 0.2em 0.5em;
    &:hover {
        background-color: royalblue;
        color: white;
    }
    transition: all 0.1s ease-in-out;
    `
const GPTButtonText = styled.span`
    color: royalblue;
    font-weight: bold;
    padding: 0.2em 0.5em;
    `

export default function SummerizedParagraphs(props) {
    const ref = useRef(null)
    const [summary, setSummary] = useState("")
    const [sideText, setSideText] = useState("")
    const [hover, setHover] = useState(false)
    const [texts, setTexts] = useState([])

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

    const getLonger = async () => {
    }
    const getShorter = async () => {
    }
    const getNew = async () => {
    }


    const element = props.paragraph
    const elementFontFamily = window.getComputedStyle(element).getPropertyValue('font-family')
    const top = element.offsetTop + props.offsetTop + 10
    const left = props.offsetLeft + 30

    return (
        <div style={{position:'absolute',top, left, width:'35vw', fontFamily:elementFontFamily}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            {sideText.length == 0 && <GPTButton onClick={getSummary}>Generate</GPTButton> }
            {sideText.length > 0 && 
                <SummaryContainer>
                    <SideText> {sideText} </SideText>
                    <div ref={ref}  dangerouslySetInnerHTML={{ __html: summary }} />
                </SummaryContainer>
            }
            {/* {sideText.length > 0 && hover && <Dot onClick={getSummary}>Regenerate</Dot> } */}
            { sideText.length > 0 && hover &&
                <>
                <GPTButtons>
                        <GPTButton onClick={getLonger}>Longer</GPTButton> |
                        <GPTButton onClick={getShorter}>Shorter</GPTButton> |
                        <GPTButton onClick={getNew}>Regenerate</GPTButton>
                        {texts.length > 1 && (
                            <>
                                <GPTButton onClick={lastText}>{'<'}</GPTButton>
                                <GPTButton onClick={nextText}>{'>'}</GPTButton>
                                <GPTButtonText>{texts.indexOf(text) + 1}/{texts.length}</GPTButtonText>
                            </>

                        )}
                    </GPTButtons>
                </>
            }
        </div>
    )
}