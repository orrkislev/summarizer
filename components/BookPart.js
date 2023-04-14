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
    border-bottom: 1px dashed #ccc;
    transition: all 0.2s ease-in-out;
    ${props => props.active ? 'margin-left: 0' : 'margin-left: -5em'};
`
const ButtonsContainer = styled.div`
    width: 5em;
    display: flex;
`


export default function BookPart({ bookPart }) {
    const [summary, setSummary] = useState("")
    const [isHidden, setIsHidden] = useState(false)
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

    const hide = () => {
        setIsHidden(true)
    }

    if (isHidden) return null

    return (
        <PartContainer>
            <ButtonsContainer>
                <SideButton onClick={getSummary} src="gpt.svg" />
                <SideButton onClick={hide} src="hide.svg" />
            </ButtonsContainer>
            <ContentContainer active={active} onClick={() => setActive(!active)}>
                {(!summary || !showSummary) && <div dangerouslySetInnerHTML={{ __html: bookPart.html }} />}
                {summary && showSummary && <div style={{ background: 'lightgreen'}}>{summary}</div>}
            </ContentContainer>
        </PartContainer>
    )
}