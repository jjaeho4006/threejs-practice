import {useCallback, useEffect, useState} from "react";

type ActionByKeyType = {
    KeyW: string;
    KeyS: string;
    KeyA: string;
    KeyD: string;
    Space: string;
    Digit1: string;
    Digit2: string;
    Digit3: string;
    Digit4: string;
    Digit5: string;
}

function actionByKey(key:  keyof ActionByKeyType):string{
    const keyActionMap: ActionByKeyType = {
        KeyW: 'moveForward',
        KeyS: 'moveBackward',
        KeyA: 'moveLeft',
        KeyD: 'moveRight',
        Space: 'jump',
        Digit1: 'dirt',
        Digit2: 'grass',
        Digit3: 'glass',
        Digit4: 'wood',
        Digit5: 'log',
    }
    return keyActionMap[key];
}

export const useKeyboard = () => {
    const [actions, setActions] = useState({
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        jump: false,
        dirt: false,
        grass: false,
        glass: false,
        wood: false,
        log: false,
    })

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const action = actionByKey(e.code as keyof ActionByKeyType);
        if(action){
            setActions((prev) => {
                return ({
                    ...prev,
                    [action]: true
                })
            })
        }
    },[])

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const actions = actionByKey(e.code as keyof ActionByKeyType);
        if(actions){
            setActions((prev) => {
                return ({
                    ...prev,
                    [actions]: false
                })
            })
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, [handleKeyDown, handleKeyUp]);

    return actions;
}