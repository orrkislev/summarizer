import { useEffect, useState } from "react"

export default function useInViewPort(ref) {
    const [isInViewport, setIsInViewport] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInViewport(entry.isIntersecting)
            },
            {
                root: null,
                rootMargin: '-10px',
                threshold: 0.1,
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    })

    return isInViewport
}