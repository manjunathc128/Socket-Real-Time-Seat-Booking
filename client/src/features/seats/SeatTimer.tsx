import { useState, useEffect } from "react"
import { Badge } from "@mantine/core"
const SeatTimer = ({ seatId, timersRef }: { seatId: number, timersRef: React.MutableRefObject<Record<number, number>> }) => {
    const [, forceUpdate] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            if (timersRef.current[seatId]) {
                forceUpdate(prev => prev + 1)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [seatId, timersRef])

    const timer = timersRef.current[seatId]
    if (!timer) return null

    return (
        <Badge size="xs" color="yellow">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Badge>
    )
}

export default SeatTimer
