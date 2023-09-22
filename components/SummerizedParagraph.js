import { useEffect, useState } from "react"
import styled from "styled-components"
import { LoaderAnim } from "./Reader"
import { getStreamWords } from "@/utils/StreamUtils"
import { useRecoilValue } from "recoil"
import { settingsAtom } from "./TopBar"

const SummaryContainer = styled.div`
    flex:1;
    text-align: justify;
    color: mediumvioletred;
    margin-right: 2em;
    `

const SideText = styled.div`
    flex:1;
    color: royalblue;
    `

export default function SummerizedParagraphs(props) {
    // const [text, getText, setText] = useStreamState("", newText => {
    //     setTexts([...texts, newText])
    // })
    // const [gist, getGist, setGist] = useStreamState("")
    const [text, setText] = useState("")
    const [gist, setGist] = useState("")
    const [hover, setHover] = useState(false)
    const [texts, setTexts] = useState([])
    const settings = useRecoilValue(settingsAtom)

    const [working, setWorking] = useState(false)

    useEffect(() => {
        if (settings.applyToAll && !text) getAction('new')
    }, [settings.applyToAll])

    const getAction = async (action) => {
        if (working) return
        setWorking(true)
        const res = await fetch('/api/summerize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current: text,
                action,
                text: props.text,
                prev: props.prev,
                next: props.next,
                use4: settings.use4,
            })
        })

        let streamText = ''
        let target
        getStreamWords(res, 
            (word) => {
                streamText += word
                if (streamText.startsWith('TITLE:')) {
                    target = 'gist'
                    streamText = ''
                } else if (streamText.endsWith('SUMMARY:')) {
                    streamText = streamText.slice(0, -9)
                    setGist(streamText)
                    setWorking(false)
                    target = 'summary'
                    streamText = ''
                } else {
                    if (target == 'gist') setGist(streamText)
                    if (target == 'summary') setText(streamText)
                }
            },
            () => {
                setTexts([...texts, text])
            })

        // getText(res)
        // setWorking(false)
    }

    const lastText = () => {
        const index = texts.indexOf(text)
        setText(texts[(index - 1 + texts.length) % texts.length])
    }
    const nextText = () => {
        const index = texts.indexOf(text)
        setText(texts[(index + 1) % texts.length])
    }

    return (
        <div style={props.style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div style={{ display: 'flex', gap: '30px', width: '60vw' }}>
                <SummaryContainer style={{ width: props.width }} >
                    {working ? <LoaderAnim /> : text}
                    <SummaryActions
                        hover={hover}
                        extended={text.length > 0 || gist.length > 0 || working}
                        withArrows={texts.length > 1}
                        get={() => getAction('new')}
                        longer={() => getAction('longer')}
                        shorter={() => getAction('shorter')}
                        new={() => getAction('new')}
                        lastText={lastText}
                        nextText={nextText}
                        currText={texts.length > 1 ? texts.indexOf(text) + 1 : 1}
                        textsLength={texts.length}
                    />
                </SummaryContainer>
                <SideText>
                    {gist}
                </SideText>
            </div>
        </div>
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

    if (!props.extended) return <GPTButton onClick={props.get}>Generate</GPTButton>

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