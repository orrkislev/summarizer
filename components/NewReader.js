import epub from 'epubjs';
import { use, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SummerizedParagraphs from './SummerizedParagraph';


const TopButtons = styled.div`
    position: fixed;
    display: flex;
    justify-content: space-between;
    margin: 2em calc(50vw - 20em);
    width: 40em;
    `
const TopButton = styled.button`
    background: none;
    padding: .5em 1em;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    &:hover {
        background: #ffffff33;
    }
    transition: all 0.1s ease-in-out;
    `

const ReaderOuter = styled.div`
    margin: 0 auto;
    width: 100vw;
    height: 90vh;
    `


const ReaderContainer = styled.div`
    width: 30em;
    min-height: 90vh;
    box-shadow: 0 0 4px #ccc;
    padding: 10px 10px 0px 10px;
    margin: 5px auto;
    background: white;
    border-radius: 5px;
    `

const Dot = styled.div`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #40E0D0;
    transition: all 0.2s ease-in-out;
    `


export default function NewReader(props) {
    const [rendition, setRendition] = useState(null);
    const bookRef = useRef(null);
    const [currTarget, setCurrTarget] = useState(null);
    const [summerizedParagraphs, setSummerizedParagraphs] = useState([]);
    const [debugText, setDebugText] = useState('')

    useEffect(() => {
        if (props.file) loadBook()
    }, [props.file]);

    const loadBook = async () => {
        const book = new epub(props.file);
        if (bookRef.current.innerHTML === "") {
            const rend = book.renderTo(bookRef.current, {
                flow: "scrolled-doc",
                width: "100%",
                height: "100%",
            })
            rend.themes.register("new", "/readerTheme.css");
            rend.themes.select("new");
            await rend.display()
            setRendition(rend);
        }
    }

    useEffect(() => {
        if (rendition) {
            rendition.on('relocated', (section) => {
                
                if (summerizedParagraphs.length > 0) return;
                setTimeout(() => {
                    const iframe = document.querySelector('iframe')
                    if (!iframe) return;
                    const firstChild = iframe.contentDocument.body.children[0]
                    if (firstChild.tagName === 'SECTION') 
                        setSummerizedParagraphs(getParagraphs(firstChild))
                }, 100)
            })


            // window.lastTarget = null;
            // const onMouse = (e)=>{
            //     setDebugText(e.type)
            //     let target = e.target;
            //     if (['BODY', 'SECTION', 'HTML'].includes(target.tagName)) return;
            //     if (target.parentElement.tagName === 'P') target = target.parentElement;

            //     if (window.lastTarget && window.lastTarget === target) return;
            //     window.lastTarget = target;
            //     setCurrTarget(target);
            // }
            // rendition.on('mousedown', onMouse)
            // rendition.on('mousemove', onMouse)
            // rendition.on('touchstart', onMouse)
        }
    }, [rendition])

    // useEffect(() => {
    //     if (currTarget) {
    //         window.lastTarget = currTarget
    //     }
    // }, [currTarget])

    if (!props.file) return null;

    const nextPage = () => {
        setSummerizedParagraphs([])
        rendition.next();
        // setCurrTarget(null)
    }
    const prevPage = () => {
        setSummerizedParagraphs([])
        rendition.prev();
        // setCurrTarget(null)
    }

    // const clickDot = () => {
    //     const index = summerizedParagraphs.findIndex(sp => sp.paragraph === currTarget)
    //     if (index !== -1) {
    //         const newSummerizedParagraphs = [...summerizedParagraphs]
    //         newSummerizedParagraphs[index].visible = !newSummerizedParagraphs[index].visible
    //         setSummerizedParagraphs(newSummerizedParagraphs)
    //         return
    //     } else {
    //         setSummerizedParagraphs([...summerizedParagraphs, {
    //             prevParagraphText: currTarget.previousSibling?.innerText,
    //             paragraph: currTarget,
    //             nextParagraphText: currTarget.nextSibling?.innerText,
    //             visible: true
    //         }])
    //     }
    // }

    // const dotPosition = { x: -10, y: -10 }
    // if (currTarget != null) {
    //     dotPosition.x = currTarget.offsetLeft + bookRef.current.offsetLeft - 15
    //     dotPosition.y = currTarget.offsetTop + bookRef.current.offsetTop + 15
    // }

    return (
        <div>
            {/* <span style={{color:'white'}}>{debugText}</span> */}
            <TopButtons>
                <TopButton onClick={prevPage}>PREV</TopButton>
                <TopButton onClick={nextPage}>NEXT</TopButton>
            </TopButtons>
            <ReaderOuter>
                <ReaderContainer id="aaaaaaaaaaa" ref={bookRef} />
            </ReaderOuter>
            {/* {currTarget != null && <Dot style={{ left: dotPosition.x, top: dotPosition.y }} onClick={clickDot} />} */}
            {summerizedParagraphs.map((sp, index) => {
                return <SummerizedParagraphs key={index}
                    paragraph={sp.paragraph}
                    visible={sp.visible}
                    onMouseEnter={() => setCurrTarget(sp.paragraph)}
                    prev={sp.prevParagraphText}
                    next={sp.nextParagraphText}
                    offsetLeft={bookRef.current.offsetLeft}
                    offsetTop={bookRef.current.offsetTop} />
            })}
        </div>
    );
}



function getParagraphs(section){
    const paragraphs = []
    Array.from(section.children).forEach((p, i) => {
        if (p.tagName == 'SECTION') paragraphs.push(...getParagraphs(p))
        const parText = p.innerText
        const words = parText.split(' ')
        if (words.length < 10) return;
        paragraphs.push({
            prevParagraphText: p.previousSibling?.innerText,
            paragraph: p,
            nextParagraphText: p.nextSibling?.innerText,
            visible: false
        })
    })
    return paragraphs
}