import { useState, useEffect } from "react";

export default function useCountdown(targetDate){
    const [time, setTime] = useState({})
    useEffect(()=>{
        const interval = setInterval(()=>{
            const diff = new Date(targetDate) = new Date()

            setTime({
                days: Math.floor(diff / (1000*60*60*24)),
                hours: Math.floor(diff / (1000*60*60)) % 24
            })
        }, 1000)

        return ()=>{clearInterval(interval)}
    }, [])

    return time
}