import epub from 'epubjs';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import TopBar from './TopBar';
import EpubGPT from './EpubGPT';
import { useBookData } from '@/utils/firebaseConfig';


const ReaderContainer = styled.div`
    margin-top: 3em;
    z-index: 1;
    position: relative;
    width: 35vw;
    margin-bottom: 5em;
    `


export default function EpubReader(props) {
    const bookStore = useBookData()
    const [cloudData, setCloudData] = useState([])
    const [rendition, setRendition] = useState(null);
    const bookRef = useRef(null);
    const bookData = useRef(null);
    const [sectionData, setSectionData] = useState({
        sectionNum:0, paragraphs: [], contentLeft: 0, contentRight: 0, font: '', label: ''
    })

    useEffect(() => {
        if (props.file) loadBook()
    }, [props.file]);

    useEffect(() => {
        if (rendition) {
            rendition.on('relocated', (section) => {
                setTimeout(() => {
                    const newSectionData = getSectionData(section, bookData.current)
                    setSectionData(newSectionData)

                    if (bookStore.bookData?.savedCloud) {
                        bookStore.getPageSummaried(newSectionData.sectionNum).then(cloudData => {
                            setCloudData(cloudData)
                        })
                    }

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
        bookStore.setBook(props.file)
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
            goToLastSection(book)
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
            <TopBar
                width={bookRef.current?.getBoundingClientRect().width}
                fontFamily={sectionData.font}
                label={sectionData.label}
                prev={prevPage} next={nextPage}
            />

            <div style={{ position: 'relative', display: 'flex', fontFamily: sectionData.font }}>
                <ReaderContainer ref={bookRef} />
                {sectionData.paragraphs.map((sp, index) => {
                    return <EpubGPT key={index}
                        paragraphNum={index}
                        pageNum={sectionData.sectionNum}
                        offset={sectionData.contentRight + sectionData.contentLeft}
                        width={sectionData.contentRight - sectionData.contentLeft}
                        height={sp.paragraph.getBoundingClientRect().height}
                        topOffset={bookRef.current.getBoundingClientRect().top}
                        paragraph={sp.paragraph}
                        prev={sp.prevParagraphText}
                        next={sp.nextParagraphText}
                        cloudData={index < cloudData.length ? cloudData[index] : null}
                    />
                })}
            </div>
        </div>
    );
}



function getParagraphs() {
    const iframe = document.querySelector('iframe')
    if (!iframe) return [[], null];

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
    Cookies.set('lastSection', section.start.href)
    const label = loc ? loc.label : ''

    const sectionNum = book.navigation.toc.findIndex(t => t.href == sectionURL)

    return { sectionNum, paragraphs, contentLeft, contentRight, font, label }
}


function goToLastSection(book) {
    const lastSection = Cookies.get('lastSection')
    if (lastSection) {
        book.navigation.toc.forEach(t => {
            if (t.href == lastSection) book.rendition.display(t.href)
            if (t.subitems.length > 0)
                t.subitems.forEach(st => {
                    if (st.href == lastSection) book.rendition.display(st.href)
                })
        })
    }
}