import {useStore} from "../hooks/useStore.ts";
import {Cube} from "./Cube.tsx";

export const Cubes = () => {
    const {cubes} = useStore();

    return cubes.map(({key, position, texture}) => {
        return (
            <Cube key={key} position={position} texture={texture}/>
        )
    })
}