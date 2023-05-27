import { useEffect, useState } from "react"

export default function MiniMap(props) {
    const [scroll, setScroll] = useState(0)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        window.addEventListener('scroll', (e) => {
            setScroll(window.scrollY / 5)
        })
        const table = props.table.current
        const rows = table.querySelectorAll('tr')[0]
        const cell = rows.querySelector('td')
        setWidth(cell.offsetWidth / 5 + 10)
    }, [])

    function drag(e){
        const delta = e.movementY
        window.scrollBy(0, delta * 1 * document.body.offsetHeight / window.innerHeight)
    }
    function stopDrag(e) {
        window.removeEventListener('mousemove', drag)
        window.removeEventListener('mouseup', stopDrag)
    }

    function startDrag(e) {
        window.addEventListener('mousemove', drag)
        window.addEventListener('mouseup', stopDrag)
    }

    const offsetTop = -((scroll * 5) / document.body.offsetHeight) * window.innerHeight * 4 + 'px'
    
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
                    cursor: grab;
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
        let cellFontSize = 16 / 5 + 'px'

        const rowChildren = row.children.length
        if (rowChildren == 1) cellFontSize = '10px'

        const inners = []
        inners.push(<div key={1} style={{width: cellWidth, color: 'transparent', textAlign: 'justify' }}><span style={{ color: 'gray' }}>{cellText}</span></div>)

        if (rowChildren == 3) {
            const cell2 = row.children[1]
            const cell2Width = cell2.offsetWidth / 5
            const cell2Text = cell2.innerText
            inners.push(<div key={2} style={{width: cell2Width, color: 'transparent' }}><span style={{ color: 'red' }}>{cell2Text}</span></div>)

            const cell3 = row.children[2]
            const cell3Width = cell3.offsetWidth / 5
            const cell3Text = cell3.innerText
            inners.push(<div key={3} style={{width: cell3Width, color: 'transparent' }}><span style={{ color: 'blue' }}>{cell3Text}</span></div>)
        }

        mapSections.push(
            <div key={cellText} style={{ fontSize: cellFontSize, height: cellHeight, color: 'transparent', display:'flex', gap:'3px'}}>
                {inners}
            </div>
        )
    })

    return mapSections
}