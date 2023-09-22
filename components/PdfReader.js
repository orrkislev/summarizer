import { useEffect, useRef, useState } from "react"
import * as PDFJS from 'pdfjs-dist/build/pdf';
import TopBar from "./TopBar";
import PdfGPT from "./PdfGPT";

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

export default function PDFReader(props) {
    const canvasRef = useRef(null)
    const pdfRef = useRef(null)
    const [pageNum, setPageNum] = useState(0)
    const [paragraphs, setParagraphs] = useState([])

    useEffect(() => {
        const file = props.file
        const fileURl = URL.createObjectURL(file)
        PDFJS.getDocument(fileURl).promise.then((pdf) => {
            props.doneLoading()
            pdfRef.current = pdf
            setPageNum(1)
        })
    }, [props.file])

    useEffect(() => {
        if (pdfRef.current) {
            setParagraphs([])
            pdfRef.current.getPage(pageNum).then((page) => {
                const canvas = canvasRef.current
                const canvasContext = canvas.getContext('2d')
                const scale = getCanvasScale()
                let viewport = page.getViewport({ scale });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = `${viewport.width * 1.5 / scale}px`;

                page.getTextContent().then((textContent) => {
                    const normalHeight = page.getViewport({ scale: 1 }).height
                    textContent.items.forEach(item => {
                        item.transform[5] = 1 - item.transform[5] / normalHeight
                        item.transform[5] *= canvas.height / (scale / 1.5)
                    })
                    textContent.items = textContent.items.filter(item => item.str != '')
                    textContent.items = textContent.items.sort((a, b) => a.transform[5] - b.transform[5])

                    setTimeout(() => {
                        let blocks = getBlocks(textContent)
                        blocks = blocks.filter(block => block.text.length > 50)
                        setParagraphs(blocks)
                    }, 1000)
                })

                page.render({
                    canvasContext,
                    viewport
                })
            })
        }
    }, [pageNum])

    const nextPage = () => {
        setPageNum(pageNum + 1)
    }
    const prevPage = () => {
        setPageNum(pageNum - 1)
    }

    const rightMost = paragraphs.reduce((acc, curr) => Math.max(acc, curr.right), 0) * 1.5

    return (
        <div>
            <TopBar
                width={200}
                fontFamily={'sans-serif'}
                label={''}
                prev={prevPage} next={nextPage} />
            <canvas ref={canvasRef}></canvas>
            {paragraphs.map((sp, index) => (
                <PdfGPT key={index}
                    left={rightMost + 30}
                    width={(sp.right - sp.left) * 1.5}
                    top={sp.top - sp.lineheight * 1.5}
                    text={sp.text}
                    prev={sp.prevParagraphText}
                    next={sp.nextParagraphText}
                />
            ))}
        </div>
    )
}






const canvasScales = { 1: 3.2, 2: 4 }
function getCanvasScale() {
    return canvasScales[window.devicePixelRatio] || 3;
}


function getBlocks(textContent) {
    let lines = []
    for (let textItem of textContent.items) {
        if (textItem.str == '' || textItem.str == ' ') continue
        const y = textItem.transform[5]
        const line = lines.find(line => Math.abs(line.y - y) < 5)
        if (line) line.items.push(textItem)
        else lines.push({ y, items: [textItem] })
    }
    lines = lines.map(line => line.items)

    lines = lines.map(line => ({
        items: line,
        done: false,
        lineheight: line.reduce((acc, curr) => Math.max(acc, curr.height), 0),
        top: line.reduce((acc, curr) => Math.min(acc, curr.transform[5]), 10000),
        bottom: line.reduce((acc, curr) => Math.max(acc, curr.transform[5] + curr.height), 0),
        left: line.reduce((acc, curr) => Math.min(acc, curr.transform[4]), 10000),
        right: line.reduce((acc, curr) => Math.max(acc, curr.transform[4] + curr.width), 0),
    }))

    console.log([...lines])


    for (let i = 1; i < lines.length; i++) {
        const thisLine = lines[i]
        const prevLine = lines[i - 1]
        if (prevLine.done) continue
        if (thisLine.top < prevLine.bottom + prevLine.lineheight * 1.8 && thisLine.top > prevLine.bottom - prevLine.lineheight) {
            prevLine.items.push(...thisLine.items)
            prevLine.bottom = Math.max(prevLine.bottom, thisLine.bottom)
            prevLine.left = Math.min(prevLine.left, thisLine.left)
            prevLine.right = Math.max(prevLine.right, thisLine.right)
            lines.splice(i, 1)
            i--
            if (thisLine.left < prevLine.left + 100 && thisLine.right < prevLine.right - 10) {
                prevLine.done = true
            }
        }
    }

    lines.forEach(line => line.text = line.items.map(item => item.str).join(' '))
    for (let i=0;i<lines.length;i++){
        lines[i].prevParagraphText = lines[i-1]?.text || ''
        lines[i].nextParagraphText = lines[i+1]?.text || ''
    }

    console.log(lines)
    return lines
}