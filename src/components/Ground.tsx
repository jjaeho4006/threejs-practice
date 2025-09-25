import {usePlane} from "@react-three/cannon";
import {groundTexture} from "../assets/images/textures.ts";
import {useStore} from "../hooks/useStore.ts";

export const Ground = () => {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2,0,0], position: [0,-0.5,0]
    }))

    const {addCube} = useStore();


    groundTexture.repeat.set(100, 100)

    return (
        <mesh ref={ref} onClick={(e) => {
            e.stopPropagation();
            const [x,y,z] = Object.values(e.point).map(v => Math.ceil(v))
            addCube(x, y, z)

        }}>
            <planeGeometry attach="geometry" args={[100,100]} />
            <meshStandardMaterial attach="material" map={groundTexture} />
        </mesh>
    )
}