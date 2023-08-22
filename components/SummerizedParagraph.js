import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const SummaryContainer = styled.div`
    width: 25vw;
    color: mediumvioletred;
    `

const SideText = styled.div`
    width: 25vw;
    color: royalblue;
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
    const [text, setText] = useState("")
    const [sideText, setSideText] = useState("")
    const [hover, setHover] = useState(false)
    const [texts, setTexts] = useState([])

    const [working, setWorking] = useState(false)

    const getGPT = async () => {
        if (working) return
        setWorking(true)
        setText('...')
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
        setText(text)
        setTexts([text])
        setSideText(gist)
        setWorking(false)
    }

    const getAction = async (action) => {
        if (working) return
        setWorking(true)
        setText('...')
        const res = await fetch('/api/newSummarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current: text,
                action,
                text: props.paragraph.innerText,
                prev: props.prev,
                next: props.next
            })
        })
        const result = await res.json()
        setText(result.summary)
        setTexts([...texts, result.summary])
        setWorking(false)
    }

    const getLonger = async () => {
        await getAction('longer')
    }
    const getShorter = async () => {
        await getAction('shorter')
    }
    const getNew = async () => {
        await getAction('new')
    }

    const lastText = () => {
        const index = texts.indexOf(text)
        setText(texts[(index - 1 + texts.length) % texts.length])
    }
    const nextText = () => {
        const index = texts.indexOf(text)
        setText(texts[(index + 1) % texts.length])
    }


    const element = props.paragraph
    const elementFontFamily = window.getComputedStyle(element).getPropertyValue('font-family')
    const elementFontSize = window.getComputedStyle(element).getPropertyValue('font-size')
    const elementLineHeight = window.getComputedStyle(element).getPropertyValue('line-height')
    const top = element.offsetTop + props.offsetTop
    const left = props.offsetLeft + 30

    return (
        <div style={{ position: 'absolute', top, left, fontFamily: elementFontFamily, fontSize: elementFontSize, lineHeight: elementLineHeight }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {sideText.length == 0 && <GPTButton onClick={getGPT}>Generate</GPTButton>}
            {sideText.length > 0 &&
                <div style={{ display: 'flex', gap: '1.5em' }}>
                    <SummaryContainer>
                        <div ref={ref} dangerouslySetInnerHTML={{ __html: text }} />
                    </SummaryContainer>
                    <SideText> {sideText} </SideText>
                </div>
            }
            {/* {sideText.length > 0 && hover && <Dot onClick={getSummary}>Regenerate</Dot> } */}
            {sideText.length > 0 && hover &&
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