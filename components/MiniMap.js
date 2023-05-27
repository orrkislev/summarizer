import { useEffect, useState } from "react"

export default function MiniMap(props) {
    const [scroll, setScroll] = useState(0)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        window.addEventListener('scroll', (e) => {
            setScroll(window.scrollY / 5)
        })
        const table = props.table.current
        const rows = table.querySelectorAll('tr')[1]
        const cell = rows.querySelector('td')
        setWidth(cell.offsetWidth / 5 + 10)
    }, [])

    function drag(e){
        const delta = e.movementY
        window.scrollBy(0, delta * 4 * document.body.offsetHeight / window.innerHeight)
    }
    function stopDrag(e) {
        window.removeEventListener('mousemove', drag)
        window.removeEventListener('mouseup', stopDrag)
    }

    function startDrag(e) {
        window.addEventListener('mousemove', drag)
        window.addEventListener('mouseup', stopDrag)
    }

    const offsetTop = -((scroll * 5) / document.body.offsetHeight) * window.innerHeight * 5 + 'px'

    return (
        <div id='mapContainer' style={{ top: offsetTop }}>
            <div id='map'>
                <div id='scroll' style={{ top: scroll }} onMouseDown={startDrag}></div>
                <MiniMapInner table={props.table} />
            </div>

            <style jsx>{`
                #scroll {
                    position: absolute;
                    height: ${window.innerHeight / 5}px;
                    width: 100%;
                    background-color: rgba(0,0,0,0.2);
                }
                #map {
                    position: absolute;
                    margin-top: 2em;
                }
                #mapContainer {
                    user-select: none;
                    position: fixed;
                    right: 0;
                    width: ${width}px;
                    height: 100%;
                    opacity: 0.5;
                }
            `}</style>
        </div>
    )
}


function MiniMapInner(props) {
    if (!props.table.current) return null

    const mapSections = []
    const table = props.table.current
    const rows = table.querySelectorAll('tr')
    rows.forEach(row => {
        const cell = row.querySelector('td')
        const cellText = cell.innerText
        const cellHeight = cell.offsetHeight / 5
        const cellWidth = cell.offsetWidth / 5
        const cellFontSize = 16 / 5 + 'px'

        const rowChildren = row.children.length
        console.log(rowChildren)
        const clr = rowChildren == 3 ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,1,1)'
        mapSections.push(
            <div key={cellText} style={{ fontSize: cellFontSize, width: cellWidth, height: cellHeight, color: 'transparent', textAlign: 'justify' }}>
                <span style={{ background: clr }}>{cellText}</span>
            </div>
        )
    })

    return mapSections
}