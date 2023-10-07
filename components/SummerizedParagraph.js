import { useEffect, useState } from "react"
import styled from "styled-components"
import { LoaderAnim } from "./Reader"
import { getStreamWords } from "@/utils/useStreamState"
import { useRecoilValue } from "recoil"
import { settingsAtom } from "./TopBar"
import { useBookData } from "@/utils/firebaseConfig"

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

const EmptyContainer = styled.div`
    width: 100%;
    height: ${props => props.height}px;
    background-color: rgba(0,0,0,0.05);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    &:hover {
        background-color: rgba(0,0,0,0.1);
        // box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transform: translateY(-2px) scale(1.01);
    }
    `

export default function SummerizedParagraphs(props) {
    const bookStore = useBookData()
    const [text, setText] = useState("")
    const [gist, setGist] = useState("")
    const [hover, setHover] = useState(false)
    const [texts, setTexts] = useState([])
    const settings = useRecoilValue(settingsAtom)

    const [working, setWorking] = useState(false)

    useEffect(() => {
        if (bookStore.bookData.savedCloud) {
            bookStore.getPageSummaried(props.paragraphNum).then(summaries => {
                if (summaries.length > 0) {
                    setTexts(summaries[0].summaries)
                    setText(summaries[0].summaries[0])
                    setGist(summaries[0].gist)
                }
            })
        }
    }, [bookStore.bookData])

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
        let newGist = ''
        getStreamWords(res,
            (word) => {
                streamText += word
                if (streamText.startsWith('TITLE:')) {
                    target = 'gist'
                    streamText = ''
                } else if (streamText.endsWith('SUMMARY:')) {
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
                bookStore.saveSummary(props.paragraphNum, props.paragraphNum, [...texts, streamText], newGist)
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

    return (
        <div style={props.style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div style={{ display: 'flex', gap: '30px', width: '60vw' }}>
                {text.length == 0 && !working ? (
                    <EmptyContainer height={props.height} onClick={() => getAction('new')} />
                ) : (
                    <>
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
                            {/* )} */}
                        </SummaryContainer>
                        <SideText>
                            {gist}
                        </SideText>
                    </>
                )}
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