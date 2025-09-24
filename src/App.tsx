import {PointerLockControls, Sky} from "@react-three/drei";
import {Ground} from "./components/Ground.tsx";
import {Physics} from "@react-three/rapier";
import {Player} from "./components/Player.tsx";
import {Cubes} from "./components/Cube.tsx";
import {useFrame} from "@react-three/fiber";
import * as TWEEN from "@tweenjs/tween.js";

const shadowOffset = 50;
export default function App() {

    useFrame(() => {
        TWEEN.update();
    });

    return (
        <>
            <PointerLockControls/>
            <Sky sunPosition={[100, 20, 100]} />
            <ambientLight intensity={1.5} />
            <directionalLight
                castShadow
                intensity={1.5}
                shadow-mapSize={4096}
                shadow-camera-top={shadowOffset}
                shadow-camera-bottom={-shadowOffset}
                shadow-camera-left={-shadowOffset}
                shadow-camera-right={shadowOffset}
                position={[100, 100, 0]}
            />
            <Physics gravity={[0, -20, 0]}>
                <Ground/>
                <Player/>
                <Cubes/>
            </Physics>
        </>
    )
}
