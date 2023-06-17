import { useEffect, useState } from "react";

export default function useLazyLoad(ref){
    const [inView, setInView] = useState(false)

    useEffect(() => {
        handleScroll()

        function handleScroll(e){
            if (!ref.current) return
            const rect = ref.current.getBoundingClientRect()
    
            if (inView == true){
                if(rect.top > window.innerHeight || rect.bottom < 0) setInView(false)
            } else {
                if(rect.bottom < window.innerHeight && rect.top >= 0) setInView(true)
            }
        }


        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [inView])

    

    return inView
}