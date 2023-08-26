import epub from 'epubjs';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SummerizedParagraphs from './SummerizedParagraph';


const TopButtons = styled.div`
    display: flex;
    gap: 5em;
    border-bottom: 1px solid #ccc;
    padding: .25em;
    background: radial-gradient(circle at 10% 20%, #FE6B8B 30%, #FF8E53 90%), radial-gradient(circle at 90% 90%, #FF8E53 30%, #FE6B8B 90%);
    `
const TopButton = styled.button`
    background: none;
    padding: .25em .5em;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    &:hover {
        background: black;
        color: white;
    }
    transition: all 0.1s ease-in-out;
    `


const ReaderContainer = styled.div`
    width: 35vw;
    margin-bottom: 5em;
    `


export default function NewReader(props) {
    const [rendition, setRendition] = useState(null);
    const bookRef = useRef(null);
    const [summerizedParagraphs, setSummerizedParagraphs] = useState([]);

    useEffect(() => {
        if (props.file) loadBook()

        const keyEvent = (e) => {
            if (e.key == 'ArrowRight') nextPage()
            if (e.key == 'ArrowLeft') prevPage()
        }

        window.addEventListener('keydown', keyEvent)

        return () => {
            window.removeEventListener('keydown', keyEvent)
        }
    }, [props.file]);

    const loadBook = async () => {
        const book = new epub(props.file);
        if (bookRef.current.innerHTML === "") {
            bookRef.current.innerHTML = " ";
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
        props.doneLoading()
    }

    useEffect(() => {
        if (rendition) {
            rendition.on('relocated', (section) => {
                if (summerizedParagraphs.length > 0) return;
                setTimeout(() => {
                    const iframe = document.querySelector('iframe')
                    if (!iframe) return;
                    const firstChild = iframe.contentDocument.body.children[0]
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

    return (
        <div>
            <TopButtons>
                <TopButton onClick={prevPage}>PREV</TopButton>
                <TopButton onClick={nextPage}>NEXT</TopButton>
            </TopButtons>

            <div style={{ position: 'relative', display: 'flex' }}>
                <ReaderContainer ref={bookRef} />
                {summerizedParagraphs.map((sp, index) => {
                    return <SummerizedParagraphs key={index}
                        paragraph={sp.paragraph}
                        prev={sp.prevParagraphText}
                        next={sp.nextParagraphText} />
                })}
            </div>
        </div>
    );
}



function getParagraphs(section) {
    const paragraphsElements = section.querySelectorAll('p')

    const paragraphs = []
    // Array.from(section.children).forEach((p, i) => {
    paragraphsElements.forEach((p, i) => {
        // if (p.tagName == 'SECTION') paragraphs.push(...getParagraphs(p))
        const parText = p.innerText
        const words = parText.split(' ')
        if (words.length < 50) return;
        paragraphs.push({
            prevParagraphText: p.previousSibling?.innerText,
            paragraph: p,
            nextParagraphText: p.nextSibling?.innerText,
            visible: false
        })
    })
    return paragraphs
}