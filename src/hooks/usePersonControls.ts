import {useEffect, useState} from "react";

export const usePersonControls = () => {
    const keys: Record<string, string> = {
        w: "forward",
        s: "backward",
        a: "left",
        d: "right",
        " ": "jump", // Space 키는 event.key === " " (공백)
    };

    const moveFieldByKey = (key: string) => keys[key];

    const [movement, setMovement] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
    })

    const setMovementStatus = (code: string, status: boolean)=> {
        setMovement((m) => ({...m, [code]: status}))
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setMovementStatus(moveFieldByKey(event.key), true)
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            setMovementStatus(moveFieldByKey(event.key), false)
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("keyup", handleKeyUp)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("keyup", handleKeyUp)
        }

    }, []);

    return movement
}