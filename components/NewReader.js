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
    background: red;
    transition: all 0.2s ease-in-out;
    `


export default function NewReader(props) {
    const [rendition, setRendition] = useState(null);
    const bookRef = useRef(null);
    const [mainDotPos, setMainDotPos] = useState({ x: 0, y: 0 })
    const [summerizedParagraphs, setSummerizedParagraphs] = useState([]);

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
                    setMainDotPos({x:firstChild.offsetLeft, y:firstChild.offsetTop})
                    setSummerizedParagraphs(getParagraphs(iframe.contentDocument.body))
                }, 100)
            })
        }
    }, [rendition])

    if (!props.file) return null;

    const nextPage = () => {
        setSummerizedParagraphs([])
        rendition.next();
    }
    const prevPage = () => {
        setSummerizedParagraphs([])
        rendition.prev();
    }

    const clickMainDot = () => {
        const newSummerizedParagraphs = [...summerizedParagraphs]
        newSummerizedParagraphs.forEach(sp => sp.visible = true)
        setSummerizedParagraphs(newSummerizedParagraphs)
    }

    return (
        <div>
            <TopButtons>
                <TopButton onClick={prevPage}>PREV</TopButton>
                <TopButton onClick={nextPage}>NEXT</TopButton>
            </TopButtons>
            <ReaderOuter>
                <ReaderContainer id="aaaaaaaaaaa" ref={bookRef} />
            </ReaderOuter>
            {mainDotPos.x != 0 && <Dot style={{ left: mainDotPos.x + bookRef.current.offsetLeft - 15, top: mainDotPos.y + bookRef.current.offsetTop + 15 }} onClick={clickMainDot}/>}
            {summerizedParagraphs.map((sp, index) => {
                return <SummerizedParagraphs key={index}
                    paragraph={sp.paragraph}
                    visible={sp.visible}
                    prev={sp.prevParagraphText}
                    next={sp.nextParagraphText}
                    offsetLeft={bookRef.current.offsetLeft}
                    offsetTop={bookRef.current.offsetTop} />
            })}
        </div>
    );
}



function getParagraphs(section){
    const paragraphsElements = section.querySelectorAll('p')

    const paragraphs = []
    // Array.from(section.children).forEach((p, i) => {
    paragraphsElements.forEach((p, i) => {
        // if (p.tagName == 'SECTION') paragraphs.push(...getParagraphs(p))
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