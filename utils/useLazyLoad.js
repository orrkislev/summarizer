import { useEffect, useState } from "react";

export default function useLazyLoad(ref){
    const [inView, setInView] = useState(false)

    useEffect(() => {
        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    function handleScroll(e){
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        if(rect.top < window.innerHeight){
            setInView(true)
        }
    }

    return inView
}