import { useState } from "react";
import BookPart, { SideButton } from "./BookPart";
import styled from "styled-components";

const SectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
    border-left: 1px dashed #ccc;
    padding-left: 1em;
    width: 100%;
`

export default function BookSection(props) {
    const [hidden, setHidden] = useState(false)

    const hide = () => {
        setHidden(true)
    }

    if (hidden) return null

    return (
        <div style={{ display: 'flex' }}>
            <div>
                <SideButton onClick={hide} src="hide.svg" />
            </div>
            <SectionContainer>
                {props.section.map((part, i) =>
                    <BookPart key={i} bookPart={part} />
                )}
            </SectionContainer>
        </div>
    )
}