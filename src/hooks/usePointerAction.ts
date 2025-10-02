import {type ThreeEvent, useThree} from "@react-three/fiber";
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

    // 두 선분 (p1, p2), (p3, p4)가 교차하는지 판정
    function checkLineIntersection(
        p1: THREE.Vector3,
        p2: THREE.Vector3,
        p3: THREE.Vector3,
        p4: THREE.Vector3
    ): { intersect: boolean; point?: THREE.Vector3 } {
        const x1 = p1.x, y1 = p1.y;
        const x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y;
        const x4 = p4.x, y4 = p4.y;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return { intersect: false };

        const px =
            ((x1 * y2 - y1 * x2) * (x3 - x4) -
                (x1 - x2) * (x3 * y4 - y3 * x4)) /
            denom;
        const py =
            ((x1 * y2 - y1 * x2) * (y3 - y4) -
                (y1 - y2) * (x3 * y4 - y3 * x4)) /
            denom;

        // 교차점이 선분 범위 안에 있는지 체크
        if (
            px < Math.min(x1, x2) || px > Math.max(x1, x2) ||
            px < Math.min(x3, x4) || px > Math.max(x3, x4) ||
            py < Math.min(y1, y2) || py > Math.max(y1, y2) ||
            py < Math.min(y3, y4) || py > Math.max(y3, y4)
        ) {
            return { intersect: false };
        }

        return { intersect: true, point: new THREE.Vector3(px, py, p1.z) };
    }


    const extractClosedPathFromSelfIntersection = (path: THREE.Vector3[]): THREE.Vector3[] | null => {
        const intersections: {indexA: number, indexB: number, point: THREE.Vector3}[] = []

        for(let i = 0; i < path.length - 1; i ++){
            for(let j = i + 2; j < path.length - 1; j ++){
                const {intersect, point} = checkLineIntersection(path[i], path[i + 1], path[j], path[j + 1])
                if(intersect && point){
                    intersections.push({indexA: i, indexB: j, point})
                }
            }
        }
        if(intersections.length === 0){
            return null;
        }

        const first = intersections[0];
        const last = intersections[intersections.length - 1];

        const closedPath = path.slice(first.indexA + 1, last.indexB + 2);
        closedPath[0] = first.point.clone();
        closedPath[closedPath.length - 1] = last.point.clone();

        return closedPath;
    }

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
            if(first.distanceTo(last) < 8){
                const closedPath = [...currentPath];
                closedPath[closedPath.length - 1] = first.clone();

                setSavedLines((prev) => [...prev, closedPath]);
            }
            else{
                const closedPath = extractClosedPathFromSelfIntersection(currentPath);

                if(closedPath){
                    setSavedLines((prev) => [...prev, closedPath])
                }
            }

        }
        setCurrentPath([])
    }

    return {handlePointerDown, handlePointerMove, handlePointerUp}
}