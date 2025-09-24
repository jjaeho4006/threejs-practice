import {RigidBody, type RigidBodyProps} from "@react-three/rapier";
import cubes from "../../Cubes.json"

export const Cubes = () => {
    return cubes.map((coords, index) =>
        <Cube key={index} position={coords as [number, number, number]} />
    );
}

const Cube = (props:RigidBodyProps) => {
    return (
        <RigidBody {...props}>
            <mesh castShadow receiveShadow>
                <meshStandardMaterial color="white" />
                <boxGeometry />
            </mesh>
        </RigidBody>
    );
}