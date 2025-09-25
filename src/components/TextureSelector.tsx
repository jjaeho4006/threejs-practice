import {useStore} from "../hooks/useStore.ts";
import {useEffect, useState} from "react";
import {useKeyboard} from "../hooks/useKeyboard.ts";
import {dirtImg, grassImg, glassImg, logImg, woodImg} from "../assets/images/images.ts";

const images = {
    dirt: dirtImg,
    grass: grassImg,
    glass: glassImg,
    wood: woodImg,
    log: logImg,
}

export const TextureSelector = () => {
    const [visible, setVisible] = useState<boolean>(false);
    const {texture: activeTexture, setTexture}= useStore();
    const {dirt, log, glass, grass, wood} = useKeyboard();



    useEffect(() => {
        const textures = {dirt, grass, glass, wood, log};
        const pressedTexture = Object.entries(textures).find(([k,v]) => v);
        if(pressedTexture){
            setTexture(pressedTexture[0] as "dirt" | "log" | "grass" | "glass" | "wood")
        }
    }, [dirt, log, glass, grass, wood, setTexture]);

    useEffect(() => {
        const visibilityTimeout = setTimeout(() => {
            setVisible(false);
        }, 2000)
        setVisible(true);
        return() => {
            clearTimeout(visibilityTimeout);
        }
    }, [activeTexture]);

    return visible && (
        <div className={"absolute centered texture-selector"}>
            {Object.entries(images).map(([key, src]) => {
                return (
                    <img key={key} src={src} alt={key} className={`${key === activeTexture ? 'active' : ''}`}/>
                )
            })}
        </div>
    )
}