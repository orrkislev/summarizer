'use client';

import MiniMap from "@/components/MiniMap";
import useLazyLoad from "@/utils/useLazyLoad";
import { useEffect, useRef, useState } from "react"
import styled from "styled-components";
import Dots from "./Dots";
import TextShow from "./TextShow";


const ID = styled.td`
    font-family: 'CrimsonText';
    padding: 0.5em;
    font-size: 0.75rem;
    color: mediumvioletred;
    width: 1em;
    text-align: center;
    ::selection {
        background-color: pink;
        color:royalblue;
    }
`

const OrigText = styled.td`
    font-family: 'CrimsonText';
    padding: 0.5em;
    font-size: 1rem;
    width: 35rem;
    text-align: justify;
    white-space: pre-wrap;
    ::selection {
        background-color: pink;
        color:royalblue;
    }
`
const GPTText = styled.td`
    font-family: 'CrimsonText';
    padding: 0.5em;
    font-size: 1.2rem;
    color: mediumvioletred;
    width: 17em;
    ::selection {
        background-color: yellow;
        color:white;
    }
`
const ShortText = styled.td`
    font-family: 'CrimsonText';
    padding: 0.5em;
    font-size: 1.2rem;
    color: royalblue;
    width: 10em;
    ::selection {
        background-color: pink;
        color:white;
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

const SectionTitle = styled.h2`
    color: royalblue;
    font-family: 'CrimsonText';
    font-size:xx-large;
    font-weight: normal;
    ::selection {
        background-color: pink;
        color:white;
    `

export default function Reader(props) {
    const tableRef = useRef(null)
    const [csv, setCsv] = useState(null);
    const [currPar, setCurrPar] = useState(1)
    const [parSum, setParSum] = useState(0)
    const [scrollTo, setScrollTo] = useState(null)

    useEffect(() => {
        if (scrollTo) {
            const cookie = document.cookie
            const cookieName = 'scrollTo'
            const cookieValue = scrollTo
            const cookieExpires = 'expires=Fri, 31 Dec 9999 23:59:59 GMT'
            document.cookie = `${cookieName}=${cookieValue};${cookieExpires};path=/`
        }
    }, [scrollTo])

    useEffect(() => {
        if (document.cookie) {
            const cookie = document.cookie
            const cookieName = 'scrollTo'
            const cookieRow = cookie.split(';').find(row => row.startsWith(cookieName))
            if (!cookieRow) return
            cookieValue = cookieRow.split('=')[1]
            setTimeout(() => setScrollTo(parseInt(cookieValue)), 500)
        }
    }, [])

    useEffect(() => {
        if (props.filename) {
            const file = '/files/' + props.filename
            fetch(file)
                .then(res => res.text())
                .then(text => {
                    const rows = text.split('\n')
                    const data = rows.map(row => row.split('\t'))
                    let counter = 0
                    const newData = data.map(row => {
                        return {
                            texts: row,
                            id: row[1] != '' ? counter++ : null
                        }
                    })
                    setParSum(counter)
                    setCsv(newData)
                })
        }
    }, [props.filename])

    useEffect(()=>{
        if (props.texts) {
            let counter = 0
            const newData = props.texts.map(row => {
                return {
                    texts: row,
                    id: row[1] != '' ? counter++ : null
                }
            })
            setParSum(counter)
            setCsv(newData)
        }
    },[props.texts])

    if (!csv) return null

    return (
        <>
            <Dots sum={parSum} curr={currPar - 1} onClick={index => setScrollTo(index)} />
            <div>
                {/* <MiniMap table={tableRef} /> */}
                <table ref={tableRef}>
                    <tbody>
                        {csv.map((row, index) => {
                            if (index === 0) return null
                            return (
                                <tr key={index}>
                                    <Row row={row.texts}
                                        index={row.id}
                                        before={index > 0 ? csv[index - 1] : null}
                                        after={index < csv.length - 1 ? csv[index + 1] : null}
                                        onActive={val => setCurrPar(row.id)}
                                        goto={scrollTo === row.id}
                                    />
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                table {
                    border-collapse: collapse;
                    margin-left: 2.5em;
                }
                tr{
                    vertical-align: top;
                }
            `}</style>

        </>
    )

}



function Row(props) {
    const [hover, setHover] = useState(false)
    const [text, setText] = useState(props.row[1])
    const [texts, setTexts] = useState([props.row[1]])
    const myRef = useRef(null)
    const inView = useLazyLoad(myRef)

    useEffect(() => {
        if (inView) props.onActive(inView)
    }, [inView])

    useEffect(() => {
        if (props.goto && myRef.current) {
            myRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [props.goto])

    async function getGPT(data) {
        setText('')
        if (props.before) data.before = props.before[0]
        if (props.after) data.after = props.after[0]
        data.text = props.row[0]
        data.current = text
        const res = await fetch('/api/newSummarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        const { summary } = await res.json()
        setTexts([...texts, summary])
        setText(summary)
    }

    function getShorter() {
        getGPT({ action: 'shorter' })
    }
    function getLonger() {
        getGPT({ action: 'longer' })
    }
    function getNew() {
        getGPT({ action: 'new' })
    }
    function lastText() {
        const currTextIndex = texts.indexOf(text)
        const nextTextIndex = (currTextIndex - 1 + texts.length) % texts.length
        setText(texts[nextTextIndex])
    }
    function nextText() {
        const currTextIndex = texts.indexOf(text)
        const nextTextIndex = (currTextIndex + 1) % texts.length
        setText(texts[nextTextIndex])
    }



    if (props.row[0] != '' && props.row[1] == '') return <td colSpan="3"><SectionTitle>{props.row[0]}</SectionTitle></td>
    return (
        <>
            <ID ref={myRef}>{props.index}</ID>
            <OrigText dangerouslySetInnerHTML={{ __html: props.row[0] }} />
            <GPTText onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                {text.length > 0 ? <TextShow text={text} /> : <LoaderAnim />}
                {hover &&
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
                }
            </GPTText>
            <ShortText>{props.row[2]}</ShortText>
        </>
    )
}





export function LoaderAnim() {
    return (
        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div>
            <style jsx>{`
            .lds-ellipsis {
                display: inline-block;
                position: relative;
                width: 80px;
                height: 80px;
              }
              .lds-ellipsis div {
                position: absolute;
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: mediumvioletred;
                animation-timing-function: cubic-bezier(0, 1, 1, 0);
              }
              .lds-ellipsis div:nth-child(1) {
                left: 4px;
                animation: lds-ellipsis1 0.6s infinite;
              }
              .lds-ellipsis div:nth-child(2) {
                left: 4px;
                animation: lds-ellipsis2 0.6s infinite;
              }
              .lds-ellipsis div:nth-child(3) {
                left: 16px;
                animation: lds-ellipsis2 0.6s infinite;
              }
              .lds-ellipsis div:nth-child(4) {
                left: 28px;
                animation: lds-ellipsis3 0.6s infinite;
              }
              @keyframes lds-ellipsis1 {
                0% {
                  transform: scale(0);
                }
                100% {
                  transform: scale(1);
                }
              }
              @keyframes lds-ellipsis3 {
                0% {
                  transform: scale(1);
                }
                100% {
                  transform: scale(0);
                }
              }
              @keyframes lds-ellipsis2 {
                0% {
                  transform: translate(0, 0);
                }
                100% {
                  transform: translate(12px, 0);
                }
              }
              
              `}</style>
        </div>
    )
}