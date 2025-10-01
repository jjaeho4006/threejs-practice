import {type ThreeEvent, useThree} from "@react-three/fiber";
import type {DecalDataType} from "../type/type";
import type {Dispatch, RefObject, SetStateAction} from "react";
import * as THREE from "three";

interface Props{
    drawMode: boolean;
    drawing: boolean;
    setDrawing: Dispatch<SetStateAction<boolean>>;
    cylinderRef: RefObject<THREE.Mesh | null>;
    currentPath: THREE.Vector3[];
    setCurrentPath: Dispatch<SetStateAction<THREE.Vector3[]>>;
    setSavedLines: Dispatch<SetStateAction<THREE.Vector3[][]>>;
}

export const usePointerAction = ({drawMode, drawing, setDrawing, cylinderRef, currentPath, setCurrentPath, setSavedLines}: Props) => {

    const { camera, gl } = useThree();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const getIntersectPoint = (e: PointerEvent):THREE.Vector3 | null => {
        if(!cylinderRef.current){
            return null;
        }

        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObject(cylinderRef.current);
        return intersects.length > 0 ? intersects[0].point.clone() : null;
    }

    const handlePointerDown = (e: ThreeEvent<PointerEvent>):void => {
        if(!drawMode){
            return;
        }

        const point = getIntersectPoint(e.nativeEvent);
        if(point){
            setDrawing(true)
            setCurrentPath([point])
        }
    }

    const handlePointerMove = (e: ThreeEvent<PointerEvent>):void => {
        if(!drawing || !drawMode){
            return;
        }

        const point = getIntersectPoint(e.nativeEvent);
        if(point){
            setCurrentPath((prev) => [...prev, point])
        }
    }

    const handlePointerUp = (e: ThreeEvent<PointerEvent>):void => {
        if(!drawing || !drawMode){
            return;
        }

        setDrawing(false)

        if(currentPath.length > 1){
            const first = currentPath[0];
            const last = currentPath[currentPath.length - 1];

            if(first.distanceTo(last) < 7){
                const closedPath = [...currentPath];
                closedPath[closedPath.length - 1] = first.clone();

                setSavedLines((prev) => [...prev, closedPath]);
            }
        }
        setCurrentPath([])
    }

    return {handlePointerDown, handlePointerMove, handlePointerUp}
}