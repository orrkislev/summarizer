import { useEffect, useState } from "react"
import styled from "styled-components"
import { LoaderAnim } from "./Reader"
import { getStreamWords } from "@/utils/useStreamState"
import { useRecoilValue } from "recoil"
import { settingsAtom } from "./TopBar"
import { useBookData } from "@/utils/firebaseConfig"

const ParagraphOverlay = styled.div`
    z-index: 100;
    position: absolute;
    background: ${props => props.show ? (props.fullShow ? 'rgb(246, 246, 254)' : 'rgba(246, 246, 254, .8)') : 'transparent'};
    border-radius: 4px;
    transition: all 0.2s ease-in-out;
    `

const SkimButton = styled.div`
    cursor: pointer;
    padding: 0.5em 2em;
    border-radius: 999px;
    font-family: 'Georgia', serif;
    color: ${props => props.show ? 'white' : 'transparent'};;
    transition: all 0.2s ease-in-out;
    background: ${props => props.show ? '#604CDD' : 'transparent'};

    &:hover {
      background: #4A3AB9;
    }
  `;

export default function SummerizedParagraphs(props) {
    const bookStore = useBookData()
    const [text, setText] = useState(null)
    const [gist, setGist] = useState("")
    const [texts, setTexts] = useState([])
    const [hover, setHover] = useState(false)
    const settings = useRecoilValue(settingsAtom)

    const [working, setWorking] = useState(false)

    useEffect(() => {
        if (props.cloudData) {
            setTexts(props.cloudData.summaries)
            setText(props.cloudData.summaries[0])
            setGist(props.cloudData.gist)
        }
    }, props.cloudData)



    useEffect(() => {
        if (settings.applyToAll && !text) getAction('new')
    }, [settings.applyToAll])

    const getAction = async (action) => {
        if (working) return
        setWorking(true)

        let url = '/api/summerize_claude'
        if (settings.model == 'gpt') url = '/api/summerize_gpt'
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current: text, action, text: props.text, prev: props.prev, next: props.next })
        })

        if (res.headers.get('content-type').includes('text/plain')) {
            const resText = await res.text()
            setText(resText.split('SUMMARY:')[1])
            setGist(resText.split('SUMMARY:')[0].split('TITLE:')[1])
            setWorking(false)
            return
        }

        let streamText = ''
        let target
        let newGist = ''
        getStreamWords(res,
            (word) => {
                streamText += word
                if (streamText.includes('TITLE:') && streamText.includes('SUMMARY:')) {
                    console.log('got title and summary')
                    setText(streamText.slice(streamText.indexOf('SUMMARY:') + 8))
                    setGist(streamText.slice(6, streamText.indexOf('SUMMARY:')))
                } if (streamText.startsWith('TITLE:') || streamText.startsWith('Title:') || streamText.startsWith('title:')) {
                    target = 'gist'
                    streamText = ''
                } else if (streamText.endsWith('SUMMARY:') || streamText.endsWith('Summary:') || streamText.endsWith('summary:')) {
                    streamText = streamText.slice(0, -9)
                    setGist(streamText)
                    newGist = streamText
                    setWorking(false)
                    target = 'summary'
                    streamText = ''
                } else {
                    if (target == 'gist') setGist(streamText)
                    if (target == 'summary') setText(streamText)
                }
            },
            () => {
                bookStore.saveSummary(props.pageNum, props.paragraphNum, [...texts, streamText], newGist)
                setTexts([...texts, text])
            })
    }

    const lastText = () => {
        const index = texts.indexOf(text)
        setText(texts[(index - 1 + texts.length) % texts.length])
    }
    const nextText = () => {
        const index = texts.indexOf(text)
        setText(texts[(index + 1) % texts.length])
    }

    const parStyle = {
        ...props.style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }

    return (
        <ParagraphOverlay show={hover || working || text} fullShow={text} style={parStyle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {!text && !working &&
                <SkimButton show={hover && !(working || text)} onClick={() => getAction('new')}>SKIM</SkimButton>
            }
            {working && <LoaderAnim />}
            {text && (
                <div style={{ padding: '1em', color: '#291794', fontSize: '1em' }}>{text}</div>
            )}
        </ParagraphOverlay>
    )
}



const GPTButtons = styled.div`
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    margin-top: 0.5em;
    font-size: 0.8rem;
    `
const GPTButton = styled.div`
    color: royalblue;
    cursor: pointer;
    border-radius: 5px;
    &:hover {
        outline: 4px solid royalblue;
        background-color: royalblue;
        color: white;
    }
    transition: all 0.1s ease-in-out;

    ${props => props.disabled && `
        color: lightgray;
        cursor: not-allowed;
        pointer-events: none;
        &:hover {
            outline: none;
            background-color: transparent;
            color: lightgray;
        }
    `}
    `
const GPTButtonText = styled.span`
    color: royalblue;
    padding: 0.2em 0.5em;
    `
function SummaryActions(props) {

    // if (!props.extended) return <GPTButton onClick={props.get}>Generate</GPTButton>

    if (props.hover) return (
        <GPTButtons>
            <GPTButton disabled onClick={props.longer}>Longer</GPTButton> |
            <GPTButton disabled onClick={props.shorter}>Shorter</GPTButton> |
            <GPTButton onClick={props.new}>Regenerate</GPTButton>
            {props.withArrows && (
                <>
                    <GPTButton onClick={props.lastText}>{'<'}</GPTButton>
                    <GPTButton onClick={props.nextText}>{'>'}</GPTButton>
                    <GPTButtonText>{props.currText}/{props.textsLength}</GPTButtonText>
                </>
            )}
        </GPTButtons>
    )

    return null
}

