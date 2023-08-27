const { default: useLazyLoad } = require("@/utils/useLazyLoad")
const { useRef, useState, useEffect } = require("react")

export default function TextShow({ text }) {
    const myRef = useRef(null)
    const [currText, setCurrText] = useState('')
    const inView = useLazyLoad(myRef)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (text === currText) return
        if (!inView) return
        if (loading) return
        setCurrText('')
        showText(text)
    }, [text, inView])

    const showText = async (text) => {
        if (!text || text === '') return
        setLoading(true)
        const words = text.split(' ')
        for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 40))
            setCurrText(words.slice(0, i + 1).join(' '))
        }
        setLoading(false)
    }

    return <div ref={myRef}>{currText}</div>
}