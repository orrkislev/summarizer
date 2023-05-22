import { useEffect, useState } from "react"
import styled from "styled-components";

const OrigText = styled.td`
    padding: 0.5em;
    font-family: Times New Roman, Times, serif;
    font-size: 1rem;
    width: 35rem;
    text-align: justify;
`
const GPTText = styled.td`
    padding: 0.5em;
    font-family: Times New Roman, Times, serif;
    font-size: 1.2rem;
    color: mediumvioletred;
    width: 17em;
`
const ShortText = styled.td`
    padding: 0.5em;
    font-family: Times New Roman, Times, serif;
    font-size: 1.2rem;
    color: royalblue;
    width: 10em;
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
const SectionTitle = styled.h2`
    color: royalblue;
    `

export default function Home() {
    const [csv, setCsv] = useState(null);

    useEffect(() => {
        const file = '/files/PostPrint.tsv'
        fetch(file)
            .then(res => res.text())
            .then(text => {
                const rows = text.split('\n')
                const data = rows.map(row => row.split('\t'))
                setCsv(data)
            })
    }, [])

    if (!csv) return null

    return (
        <div>
            <table>
                <tbody>
                    {csv.map((row, index) => {
                        if (index === 0) return null
                        return (
                            <tr key={index}>
                                <Row row={row}
                                    before={index > 0 ? csv[index - 1] : null}
                                    after={index < csv.length - 1 ? csv[index + 1] : null}
                                />
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <style jsx>{`
                table {
                    border-collapse: collapse;
                    margin: 0 auto;
                }
                tr{
                    vertical-align: top;
                }
            `}</style>

        </div>
    )

}



function Row(props) {
    const [hover, setHover] = useState(false)
    const [text, setText] = useState(props.row[1])

    async function getGPT(data) {
        setText('...')
        if (props.before) data.before = props.before[0]
        if (props.after) data.after = props.after[0]
        data.text = props.row[0]
        const res = await fetch('/api/newSummarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        const { text } = await res.json()
        setText(text)
    }

    function getShorter() {
        getGPT({ target: text.split(' ').length - 10 })
    }
    function getLonger() {
        getGPT({ target: text.split(' ').length + 10 })
    }
    function getNew() {
        getGPT({ target: props.row[1].split(' ').length })
    }



    if (props.row[0] != '' && props.row[1] == '') return <td colSpan="3"><SectionTitle>{props.row[0]}</SectionTitle></td>
    return (
        <>
            <OrigText>{props.row[0]}</OrigText>
            <GPTText onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <TextShow text={text} />
                {hover &&
                    <GPTButtons>
                        <GPTButton onClick={getLonger}>Longer</GPTButton> |
                        <GPTButton onClick={getShorter}>Shorter</GPTButton> |
                        <GPTButton onClick={getNew}>Regenerate</GPTButton>
                    </GPTButtons>
                }
            </GPTText>
            <ShortText>{props.row[2]}</ShortText>
        </>
    )
}

function TextShow({ text }) {
    const [currText, setCurrText] = useState('')


    useEffect(() => {
        if (text === currText) return
        setCurrText('')
        showText(text)
    }, [text])

    const showText = async (text) => {
        const words = text.split(' ')
        for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
            setCurrText(words.slice(0, i + 1).join(' '))
        }
    }

    return <>{currText}</>
}