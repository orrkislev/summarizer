import epub from 'epubjs';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const ReaderContainer = styled.div`
    width: 40vw;
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
    const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });

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
            let lastElement = null;
            rendition.on('mousemove', (e) => {
                let target = e.target;
                if (['BODY','SECTION','HTML'].includes(target.tagName)) return;
                if (target.parentElement.tagName === 'P') target = target.parentElement;

                if (lastElement && lastElement === target) return;

                target.classList.add('highlighted-paragraph');
                if (lastElement) lastElement.classList.remove('highlighted-paragraph');
                lastElement = target;
                setDotPosition({ x: target.offsetLeft + bookRef.current.offsetLeft - 10, y: target.offsetTop + bookRef.current.offsetTop + 10 })
            })
        }
    }, [rendition])

    if (!props.file) return null;

    const nextPage = () => {
        rendition.next();
    }
    const prevPage = () => {
        rendition.prev();
    }

    return (
        <div>
            <div style={{ marginTop: '20px', background: 'pink' }}>
                <button onClick={prevPage}>Prev</button>
                <button onClick={nextPage}>Next</button>
            </div>
            <ReaderContainer ref={bookRef} />
            <Dot style={{ top: dotPosition.y, left: dotPosition.x }} />
        </div>
    );
}