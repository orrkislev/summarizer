import { useState } from "react"
import styled from "styled-components"

export const SideButton = styled.img`
    cursor: pointer;
    width: 20px;
    height: 20px;
    margin: 0.5em;
`

const PartContainer = styled.div`
    display: flex;
    position: relative;
`
const ContentContainer = styled.div`
    background: #fff;
    width: 100%;
    padding-bottom: 1em;
    transition: all 0.2s ease-in-out;
`

// buttons should be sticky when scrolling
const ButtonsContainer = styled.div`
    width: 5em;
`
const ButtonsContainerInner = styled.div`
`



export default function BookPart({ bookPart }) {
    const [summary, setSummary] = useState("")
    const [active, setActive] = useState(false)
    const [showSummary, setShowSummary] = useState(true)

    const getSummary = async () => {
        if (summary !== "") {
            setShowSummary(!showSummary)
            return
        }
        setSummary('...')
        const res = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: bookPart.content })
        })
        const { text } = await res.json()
        setSummary(text)
    }

    return (
        <PartContainer>
            <ButtonsContainer active={active}>
                <ButtonsContainerInner>
                    <SideButton onClick={getSummary} src="gpt.svg" />
                </ButtonsContainerInner>
            </ButtonsContainer>
            <ContentContainer onClick={() => setActive(!active)}>
                {(!summary || !showSummary) && <div dangerouslySetInnerHTML={{ __html: bookPart.html }} />}
                {summary && showSummary && <div style={{ background: 'lightgreen' }}>{summary}</div>}
            </ContentContainer>
        </PartContainer>
    )
}