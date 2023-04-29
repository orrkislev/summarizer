import { useState } from "react";
import BookPart, { SideButton } from "./BookPart";
import styled from "styled-components";

const SectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
    width: 100%;
`

export default function BookSection(props) {
    return (
        <div style={{ display: 'flex' }}>
            <SectionContainer>
                {props.section.map((part, i) =>
                    <BookPart key={i} bookPart={part} prev={i>0 ? props.section[i-1] : null} next={i<props.section.length-1 ? props.section[i+1] : null} />
                )}
            </SectionContainer>
        </div>
    )
}