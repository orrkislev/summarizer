import styled from "styled-components";

const DotsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(30, 1fr);
    position: fixed;
    bottom: 1em;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5em;
    width: 70ev;
    border-radius: 10px;
    align-items: center;
    font-family: 'CrimsonText';
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(5px);
    
`;

const DotsItem = styled.div`
    flex: 1;
    font-size: 0.8em;
    margin: 0 0.5em;
    text-align: center;
    color:royalblue;
    cursor: pointer;
    ${props => props.active && `
        font-weight: bold;
        font-size: 1em;
        margin: 0 0.3em;
        color: mediumvioletred;
    `}
    `;


export default function Dots(props) {
    return (
        <DotsContainer>
            {Array(props.sum-1).fill(0).map((_, i) => 
                <DotsItem key={i} active={props.curr == i} onClick={() => props.onClick(i+1)} >{i+1}</DotsItem>
            )}
        </DotsContainer>
    )
}