import {useBox} from "@react-three/cannon";

import {
    dirtTexture,
    logTexture,
    grassTexture,
    glassTexture,
    woodTexture,
} from "../assets/images/textures.ts";
import {useStore} from "../hooks/useStore.ts";

interface Props {
    position: [number, number, number];
    texture: "dirt" | "log" | "grass" | "glass" | "wood";
}

const textureMap = {
    dirt: dirtTexture,
    log: logTexture,
    grass: grassTexture,
    glass: glassTexture,
    wood: woodTexture,
};

export const Cube = ({position, texture}: Props) => {

    const [ref] = useBox(() => ({
        type: 'Static',
        position
    }))

    const {addCube, removeCube} = useStore();

    return (
        <mesh ref={ref} onClick={(e) => {
            e.stopPropagation();
            const clickedFace = e.faceIndex ? Math.floor(e.faceIndex / 2) : null;
            const {x, y, z} = ref.current.position;
            if(e.altKey){
                removeCube(x, y, z)
            }
            else if(clickedFace === 0){
                addCube(x+1, y, z)
                return;
            }
            else if(clickedFace === 1){
                addCube(x-1, y, z)
            }
            else if(clickedFace === 2){
                addCube(x, y+1, z)
            }
            else if(clickedFace === 3){
                addCube(x, y-1, z)
            }
            else if(clickedFace === 4){
                addCube(x, y, z+1)
            }
            else if(clickedFace === 5){
                addCube(x-1, y, z-1)
            }
        }}>
            <boxGeometry attach="geometry" args={[1,1,1]} />
            <meshStandardMaterial attach="material" map={textureMap[texture]} />
        </mesh>
    )
}