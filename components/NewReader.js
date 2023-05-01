import epub from 'epubjs';
import { use, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SummerizedParagraphs from './SummerizedParagraph';


const TopButtons = styled.div`
    position: fixed;
    display: flex;
    justify-content: space-between;
    margin: 2em 23vw;
    width: 54vw;
    `
const TopButton = styled.button`
    background: none;
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
    width: 40vw;
    min-height: 90vh;
    box-shadow: 0 0 4px #ccc;
    padding: 10px 10px 0px 10px;
    margin: 5px auto;
    background: white;
    border-radius: 5px;
    `

const Dot = styled.div`
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: red;
    transition: all 0.2s ease-in-out;
    `


export default function NewReader(props) {
    const [rendition, setRendition] = useState(null);
    const bookRef = useRef(null);
    const [currTarget, setCurrTarget] = useState(null);
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
            rendition.on('render', (e) => {
                setCurrTarget(null);
            })
            window.lastTarget = null;
            rendition.on('mousemove', (e) => {
                let target = e.target;
                if (['BODY', 'SECTION', 'HTML'].includes(target.tagName)) return;
                if (target.parentElement.tagName === 'P') target = target.parentElement;

                if (window.lastTarget && window.lastTarget === target) return;
                window.lastTarget = target;
                setCurrTarget(target);
            })
        }
    }, [rendition])

    useEffect(() => {
        if (currTarget) {
            window.lastTarget = currTarget
        }
    }, [currTarget])

    if (!props.file) return null;

    const nextPage = () => {
        rendition.next();
        setSummerizedParagraphs([])
        setCurrTarget(null)
    }
    const prevPage = () => {
        rendition.prev();
        setSummerizedParagraphs([])
        setCurrTarget(null)
    }

    const clickDot = () => {
        const index = summerizedParagraphs.findIndex(sp => sp.paragraph === currTarget)
        if (index !== -1) {
            const newSummerizedParagraphs = [...summerizedParagraphs]
            newSummerizedParagraphs[index].visible = !newSummerizedParagraphs[index].visible
            setSummerizedParagraphs(newSummerizedParagraphs)
            return
        } else {
            setSummerizedParagraphs([...summerizedParagraphs, { paragraph: currTarget, visible: true }])
        }
    }

    const dotPosition = { x: -10, y: -10 }
    if (currTarget != null) {
        dotPosition.x = currTarget.offsetLeft + bookRef.current.offsetLeft - 10
        dotPosition.y = currTarget.offsetTop + bookRef.current.offsetTop + 10
    }

    return (
        <div>
            <TopButtons>
                <TopButton onClick={prevPage}>PREV</TopButton>
                <TopButton onClick={nextPage}>NEXT</TopButton>
            </TopButtons>
            <ReaderOuter>
                <ReaderContainer ref={bookRef} />
            </ReaderOuter>
            {currTarget != null && <Dot style={{ left: dotPosition.x, top: dotPosition.y }} onClick={clickDot} />}
            {summerizedParagraphs.map((sp, index) => {
                return <SummerizedParagraphs key={index}
                    paragraph={sp.paragraph}
                    visible={sp.visible}
                    onMouseEnter={() => setCurrTarget(sp.paragraph)}
                    offsetLeft={bookRef.current.offsetLeft}
                    offsetTop={bookRef.current.offsetTop} />
            })}
        </div>
    );
}