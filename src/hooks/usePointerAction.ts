import {type ThreeEvent, useThree} from "@react-three/fiber";
import type {Dispatch, RefObject, SetStateAction} from "react";
import * as THREE from "three";
import {extractClosedPathFromSelfIntersection} from "../utils/polygonUtils.ts";

interface Props{
    drawMode: boolean;
    drawing: boolean;
    setDrawing: Dispatch<SetStateAction<boolean>>;
    cylinderRef: RefObject<THREE.Mesh | null>; // 그릴 대상 mesh 참조
    currentPath: THREE.Vector3[]; // 현재 드로잉 중인 좌표 리스트
    setCurrentPath: Dispatch<SetStateAction<THREE.Vector3[]>>;
    setSavedLines: Dispatch<SetStateAction<THREE.Vector3[][]>>;
}

/**
 * 3D CylinderRef의 표면 위에서 마우스 드로잉을 통해 폐곡선을 형성하는 기능
 */
export const usePointerAction = ({drawMode, drawing, setDrawing, cylinderRef, currentPath, setCurrentPath, setSavedLines}: Props) => {

    const { camera, gl } = useThree();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    /**
     * Pointer 이벤트의 화면 좌표(e.clientX, e.clientY)를 Three.js의 NDC 좌표(-1 ~ 1)로 변환하고,
     * Raycaster를 이용해서 cylinderRef와의 교차점을 계산하여 실제 3D 공간상의 좌표(THREE.Vector3)로 반환
     */
    const getIntersectPoint = (e: PointerEvent):THREE.Vector3 | null => {
        if(!cylinderRef.current){
            return null;
        }

        // 마우스 좌표 -> NDC 변환
        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // 카메라 방향으로 Ray 발사 후 mesh와의 교차점 계산
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObject(cylinderRef.current);
        return intersects.length > 0 ? intersects[0].point.clone() : null;
    }

    /**
     * drawMode = true일때만 동작
     * 클릭한 지점을 시작점으로 설정 후 드로잉 시작(drawing = true)
     */
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

    /**
     * drawMode = true일때만 동작
     * 마우스를 움직이는 동안 표면 위 좌표를 실시간으로 추가해 현재 경로 업데이트
     */
    const handlePointerMove = (e: ThreeEvent<PointerEvent>):void => {
        if(!drawing || !drawMode){
            return;
        }

        const point = getIntersectPoint(e.nativeEvent);
        if(point){
            setCurrentPath((prev) => [...prev, point])
        }
    }

    /**
     * 드로잉 종료 시 호출
     * 현재 경로가 폐곡선을 이루는지 판단하고, 폐곡선이면 setSavedLines에 저장
     * 교차점이 있는 경우 extractClosedPathFromSelfIntersection()로 실제 폐곡선 부분만 추출
     */
    const handlePointerUp = ():void => {
        if(!drawing || !drawMode){
            return;
        }

        setDrawing(false)

        if(currentPath.length > 1){
            const first = currentPath[0];
            const last = currentPath[currentPath.length - 1];

            // 시작점과 끝점이 일정 거리 이내면 -> 명시적 폐곡선으로 간주
            if(first.distanceTo(last) < 8){
                const closedPath = [...currentPath];
                closedPath[closedPath.length - 1] = first.clone(); // 정확히 폐곡선 닫기

                setSavedLines((prev) => [...prev, closedPath]);
            }
            else{
                // 자가 교차 폐곡선일 경우, 교차점을 기준으로 폐곡선 추출
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