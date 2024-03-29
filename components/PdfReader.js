import { useEffect, useRef, useState } from "react"
import * as PDFJS from 'pdfjs-dist/build/pdf';
import TopBar from "./TopBar";
import PdfGPT from "./PdfGPT";
import Cookies from 'js-cookie';
import { useBookData } from "@/utils/firebaseConfig";


PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

export default function PDFReader(props) {
    const bookStore = useBookData()
    const canvasRef = useRef(null)
    const pdfRef = useRef(null)
    const [pageNum, setPageNum] = useState(0)
    const [paragraphs, setParagraphs] = useState([])
    const [cloudData, setCloudData] = useState([])

    useEffect(() => {
        const file = props.file
        const fileURl = URL.createObjectURL(file)
        bookStore.setBook(file)
        PDFJS.getDocument(fileURl).promise.then((pdf) => {
            props.doneLoading()
            pdfRef.current = pdf
            const lastPage = parseInt(Cookies.get('PDF_'+file.name+'_lastPage'))
            if (lastPage && lastPage < pdf.numPages) setPageNum(lastPage)
            else setPageNum(1)
        })
    }, [props.file])

    useEffect(() => {
        if (pdfRef.current) {
            Cookies.set('PDF_'+props.file.name+'_lastPage', pageNum)
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

                    setTimeout(async () => {
                        let blocks = getBlocks(textContent)
                        let str = ''
                        blocks.forEach(block => str += block.text + '\n')
                        blocks = blocks.filter(block => block.text.split(' ').length > 50)
                        setParagraphs(blocks)
                    }, 100)
                })

                page.render({
                    canvasContext,
                    viewport
                })
            })

            if (bookStore.bookData?.savedCloud) {
                bookStore.getPageSummaried(pageNum).then(cloudData => {
                    setCloudData(cloudData)
                })
            }

            const keyFunc = (e) => {
                if (e.key == 'ArrowRight') nextPage()
                if (e.key == 'ArrowLeft') prevPage()
            }
            window.addEventListener('keydown', keyFunc)
            return () => window.removeEventListener('keydown', keyFunc)
        }
    }, [pageNum])

    const nextPage = () => {
        if (pageNum < pdfRef.current.numPages) setPageNum(pageNum + 1)
    }
    const prevPage = () => {
        if (pageNum > 1) setPageNum(pageNum - 1)
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
                    paragraphNum={index}
                    pageNum={pageNum}
                    left={rightMost + 30}
                    width={(sp.right - sp.left) * 1.5}
                    top={sp.top - sp.lineheight * 1.5}
                    height={(sp.bottom - sp.top)}
                    text={sp.text}
                    prev={sp.prevParagraphText}
                    next={sp.nextParagraphText}
                    cloudData={index < cloudData.length ? cloudData[index] : null}
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
            if (thisLine.left < prevLine.left + 100 && thisLine.right < prevLine.right - 100) {
                prevLine.done = true
            }
        }
    }

    lines.forEach(line => line.text = line.items.map(item => item.str).join(' '))
    for (let i=0;i<lines.length;i++){
        lines[i].prevParagraphText = lines[i-1]?.text || ''
        lines[i].nextParagraphText = lines[i+1]?.text || ''
    }
    return lines
}