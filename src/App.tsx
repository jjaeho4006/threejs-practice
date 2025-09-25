import {Canvas} from "@react-three/fiber";
import {Sky} from "@react-three/drei";
import {Physics} from "@react-three/cannon";
import {Ground} from "./components/Ground.tsx";
import {Player} from "./components/Player.tsx";
import {FPV} from "./components/FPV.tsx";
import {Cubes} from "./components/Cubes.tsx";
import {TextureSelector} from "./components/TextureSelector.tsx";
import {Menu} from "./components/Menu.tsx";

export default function App() {

    return (
        <>
            <Canvas>
                <Sky sunPosition={[100, 100, 20]}/>
                <ambientLight intensity={2} />
                <FPV/>
                <Physics>
                    <Player/>
                    <Cubes/>
                    <Ground/>
                </Physics>
            </Canvas>
            <div className={"absolute centered cursor"}>+</div>
            <TextureSelector/>
            <Menu/>
        </>
    )
}
