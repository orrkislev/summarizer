import epub from 'epubjs';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SummerizedParagraphs from './SummerizedParagraph';


const TopBar = styled.div`
    z-index: 100;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: .25em;
    background: radial-gradient(circle at 10% 20%, #FE6B8B 30%, #FF8E53 90%), radial-gradient(circle at 90% 90%, #FF8E53 30%, #FE6B8B 90%);
    border-bottom: 1px solid #ccc;
    `

const TopButtons = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1em;
    `
const TopButton = styled.div`
    padding: .25em .5em;
    cursor: pointer;
    border-radius: 5px;
    &:hover {
        background: black;
        color: white;
    }
    transition: all 0.1s ease-in-out;

    ${props => props.active && `
        background: #ffffff88;
    }`}

    `


const ReaderContainer = styled.div`
    margin-top: 3em;
    z-index: 1;
    position: relative;
    width: 35vw;
    margin-bottom: 5em;
    `


export default function NewReader(props) {
    const [rendition, setRendition] = useState(null);
    const bookRef = useRef(null);
    const bookData = useRef(null);
    const [sectionData, setSectionData] = useState({
        paragraphs: [], contentLeft: 0, contentRight: 0, font: '', label: ''
    })
    const [use4, setUse4] = useState(false)
    const [applyToAll, setApplyToAll] = useState(false)

    useEffect(() => {
        if (props.file) loadBook()
    }, [props.file]);

    useEffect(() => {
        if (rendition) {
            rendition.on('relocated', (section) => {
                setTimeout(() => {
                    setSectionData(getSectionData(section, bookData.current))
                }, 100)
            })

            const keyListener = (e) => {
                if (e.key == 'ArrowRight') nextPage()
                if (e.key == 'ArrowLeft') prevPage()
            }
            document.addEventListener('keydown', keyListener)
            return () => document.removeEventListener('keydown', keyListener)
        }
    }, [rendition])






    const loadBook = async () => {
        const book = new epub(props.file);
        bookData.current = book;
        if (bookRef.current.innerHTML === "") {
            bookRef.current.innerHTML = " ";
            const rend = book.renderTo(bookRef.current, {
                flow: "scrolled-doc",
                width: "100%",
                height: "100%",
            })
            rend.themes.select("new");
            await rend.display()
            setRendition(rend);
        }
        props.doneLoading()
    }

    if (!props.file) return null;

    const nextPage = () => {
        setSectionData({ ...sectionData, paragraphs: [] })
        rendition.next();
    }
    const prevPage = () => {
        setSectionData({ ...sectionData, paragraphs: [] })
        rendition.prev();
    }

    return (
        <div>
            <TopBar style={{ fontFamily: sectionData.font }}>
                <TopButtons style={{ width: bookRef.current?.getBoundingClientRect().width }}>
                    <TopButton onClick={prevPage}>prev</TopButton>
                    {sectionData.label}
                    <TopButton onClick={nextPage}>next</TopButton>
                </TopButtons>
                <TopButtons style={{ marginRight: '2em' }}>
                    <TopButton active={use4} onClick={() => setUse4(!use4)}>{use4 ? 'GPT-4' : 'GPT-3.5'}</TopButton>
                    <TopButton active={applyToAll} onClick={() => setApplyToAll(!applyToAll)}>{applyToAll ? 'Apply to all' : 'one by one'}</TopButton>
                </TopButtons>
            </TopBar>

            <div style={{ position: 'relative', display: 'flex', fontFamily: sectionData.font }}>
                <ReaderContainer ref={bookRef} />
                {sectionData.paragraphs.map((sp, index) => {
                    return <SummerizedParagraphs key={index}
                        offset={sectionData.contentRight + sectionData.contentLeft}
                        width={sectionData.contentRight - sectionData.contentLeft}
                        topOffset={bookRef.current.getBoundingClientRect().top}
                        paragraph={sp.paragraph}
                        prev={sp.prevParagraphText}
                        next={sp.nextParagraphText}
                        use4={use4}
                        apply={applyToAll}
                    />
                })}
            </div>
        </div>
    );
}



function getParagraphs() {
    const iframe = document.querySelector('iframe')
    if (!iframe) return [];

    const paragraphsElements = iframe.contentDocument.body.querySelectorAll('p')

    const paragraphs = []
    paragraphsElements.forEach((p, i) => {
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
    // const mainElement = paragraphs.length > 0 ? paragraphs[0].paragraph : iframe.contentDocument.body
    const mainElement = iframe.contentDocument.body
    return [paragraphs, mainElement]
}

function getSectionData(section, book) {
    // ------------------ get paragraphs ------------------
    const [paragraphs, mainElement] = getParagraphs()

    // ------------------ get content dimensions ------------------
    let contentLeft = paragraphs.reduce((min, p) => {
        const left = p.paragraph.getBoundingClientRect().left
        return Math.min(min, left)
    }, paragraphs.length > 0 ? 10000 : mainElement.getBoundingClientRect().left)
    let contentRight = paragraphs.reduce((max, p) => {
        const right = p.paragraph.getBoundingClientRect().right
        return Math.max(max, right)
    }, paragraphs.length > 0 ? 0 : mainElement.getBoundingClientRect().right)

    // ------------------ get font ------------------
    const font = window.getComputedStyle(mainElement).getPropertyValue('font-family')

    // ------------------ get section label ------------------
    const sectionURL = section.start.href
    let loc = null
    book.navigation.toc.forEach(t => {
        if (t.href == sectionURL) loc = t
        if (t.subitems.length > 0)
            t.subitems.forEach(st => {
                if (st.href == sectionURL) loc = st
            })
    })
    const label = loc ? loc.label : ''

    return { paragraphs, contentLeft, contentRight, font, label }
}