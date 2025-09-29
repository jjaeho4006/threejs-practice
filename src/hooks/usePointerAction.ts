import type {ThreeEvent} from "@react-three/fiber";
import type {DecalDataType} from "../type/type";
import type {Dispatch, RefObject, SetStateAction} from "react";
import * as THREE from "three";

interface Props{
    drawMode: boolean;
    currentShape: DecalDataType | null;
    setCurrentShape: Dispatch<SetStateAction<DecalDataType | null>>;
    drawing: boolean;
    setDecals: Dispatch<SetStateAction<DecalDataType[]>>;
    setDrawing: Dispatch<SetStateAction<boolean>>;
    cylinderRef: RefObject<THREE.Mesh | null>;
    currentPath: THREE.Vector3[];
    setCurrentPath: Dispatch<SetStateAction<THREE.Vector3[]>>;
}

export const usePointerAction = ({drawMode, currentShape, setCurrentShape, drawing, setDecals, setDrawing, cylinderRef, currentPath, setCurrentPath}: Props) => {

    const isPathClosed = (path: THREE.Vector3[], threshold: number = 2): boolean => {
        if(path.length < 3){
            return false;
        }
        const first = path[0];
        const last = path[path.length - 1];
        return first.distanceTo(last) < threshold;
    }

    const createShapeFromPath = (path: THREE.Vector3[]): THREE.Shape => {
        const shape = new THREE.Shape();
        if(path.length === 0){
            return shape;
        }

        shape.moveTo(path[0].x, path[0].y);

        for(let i = 1; i < path.length; i ++){
            shape.lineTo(path[i].x, path[i].y);
        }

        shape.closePath();
        return shape;
    }
    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {

        if (!drawMode || !cylinderRef.current) {
            return;
        }
        e.stopPropagation();

        const localPos = cylinderRef.current!.worldToLocal(e.point.clone())

        setCurrentPath([localPos]);
        setDrawing(true);

        const decal: DecalDataType = {
            position: localPos,
            rotation: new THREE.Euler(),
            scale: [1, 1, 1],
            texture: '',
            isTemporary: true
        }

        setCurrentShape(decal)
        setDrawing(true);
    }

    const handlePointerMove  = (e:ThreeEvent<PointerEvent>) => {

        if(!drawing || !drawMode || !cylinderRef.current){
            return;
        }

        const localPos = cylinderRef.current!.worldToLocal(e.point.clone())

        setCurrentPath((prev) => [...prev, localPos]);

        setCurrentShape((prev) => prev ? {...prev, position: localPos} : null);
    }

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (!drawing || !currentShape) {
            return;
        }

        if(isPathClosed(currentPath)){
            const shape = createShapeFromPath(currentPath);

            const center = new THREE.Vector3();
            currentPath.forEach((point) => center.add(point));
            center.divideScalar(currentPath.length);

            let maxDistance = 0;
            currentPath.forEach((point) => {
                const distance = center.distanceTo(point);
                if(distance > maxDistance){
                    maxDistance = distance;
                }
            })

            const finalDecal: DecalDataType = {
                position: center,
                rotation: new THREE.Euler(),
                scale: [maxDistance * 2, maxDistance * 2, 1],
                texture: '',
                path: currentPath,
                isTemporary: false
            }

            setDecals((prev) => [...prev, finalDecal]);
        }

        setCurrentPath([])
        setCurrentShape(null);
        setDrawing(false)

    }

    return {handlePointerDown, handlePointerMove, handlePointerUp}
}