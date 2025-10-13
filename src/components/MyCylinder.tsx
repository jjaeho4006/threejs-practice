import {Line} from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import {useThree} from "@react-three/fiber";
import {DecalItem} from "./DecalItem.tsx";
import type {DecalDataType, DropDataType} from "../type/type";
import {usePointerAction} from "../hooks/usePointerAction.ts";
import {alignUvsToAnchor, toUV_Cylinder} from "../utils/common.ts";
import {MaskedDecal} from "./MaskedDecal.tsx";
import {pointInPolygon} from "../utils/polygonUtils.ts";

interface Props {
    newDrop?: DropDataType;
    drawMode: boolean;
}

/**
 * 원통(mesh)에 마우스 드로잉 및 텍스처 드롭 기능 제공
 * 사용자가 원통 위에 선(line)을 그리고, 해당 영역 안에 드롭이 발생하면 그 영역에 텍스처를 표시
 * @param newDrop 새로 드롭된 텍스처 데이터
 * @param drawMode 그리기 모드 여부
 */
export const MyCylinder = ({ newDrop, drawMode }: Props) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null); //  3D 객체(원통)의 참조
    const [currentPath, setCurrentPath] = useState<THREE.Vector3[]>([]); // 현재 드로잉 중인 라인의 점들(Vector3 배열)
    const [savedLines, setSavedLines] = useState<THREE.Vector3[][]>([]); // 사용자가 그린 모든 경로(저장된 선들)
    const [decals, setDecals] = useState<DecalDataType[]>([]); // 원통에 붙일 디칼(개별 이미지 스티커) 리스트
    const [drawing, setDrawing] = useState<boolean>(false);
    const [dropTextures, setDropTextures] = useState<{pathIdx: number; texture: string}[]>([]) // 드롭된 텍스처와 연결된 경로 인덱스
    const [hiddenLineIndices, setHiddenLineIndices] = useState<Set<number>>(new Set()); // 텍스처 이미지가 입혀진 숨길 라인 인덱스
    const { camera } = useThree();

    const {handlePointerMove, handlePointerUp, handlePointerDown} = usePointerAction({drawMode, drawing, setDrawing, cylinderRef, currentPath, setCurrentPath, setSavedLines})

    /**
     * 새로운 drop 감지
     * 새로운 드롭이 생기면 raycaster로 원통에 닿은 위치를 계산
     * 해당 위치가 사용자가 그린 경로 내부인지 판별 후
     * 내부라면 해당 영역에 texture 매핑 / 아니라면 개별 decal로 붙임
     */
    useEffect(() => {
        if (!newDrop || !cylinderRef.current) {
            return;
        }

        // 마우스 좌표(NDC 기준)에서 광선 발사
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(newDrop.ndcX, newDrop.ndcY);
        raycaster.setFromCamera(mouse, camera);

        // 원기둥과의 교차점 탐색
        const intersects = raycaster.intersectObject(cylinderRef.current);
        if (intersects.length === 0) {
            return;
        }

        // 첫번째 교차점만 사용
        const intersect = intersects[0];
        const localPos = cylinderRef.current.worldToLocal(intersect.point.clone());

        const dropUV = toUV_Cylinder(localPos); // drop 위치를 UV로 변환

        let matchedIdx: number | null = null;

        // 저장된 각 선(line)에 대해 드롭이 내부에 있는지 검사
        for(let idx = 0; idx < savedLines.length; idx ++){
            const path = savedLines[idx];
            if(path.length < 3){
                continue; // 다각형이 아닌경우 무시
            }

            const pathUVs = path.map(toUV_Cylinder);
            const alignedPathUVs = alignUvsToAnchor(pathUVs, dropUV.x);
            const alignedDropUV = new THREE.Vector2(dropUV.x, dropUV.y);

            // 실제 다각형 내부 판별
            if(pointInPolygon(alignedDropUV, alignedPathUVs)){
                matchedIdx = idx;
                break;
            }
        }

        // 드롭이 폐곡선 내부에 있으면 해당 경로에 texture 매핑
        if(matchedIdx !== null){
            setDropTextures((prev) => [...prev, {pathIdx: matchedIdx, texture: newDrop.texture}])
            setHiddenLineIndices((prev) => new Set(prev).add(matchedIdx));
            return;
        }

        // 폐곡선 외부면 개별 decal 객체 추가
        const decal: DecalDataType = {
            position: localPos,
            rotation: new THREE.Euler().setFromQuaternion(
                new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    intersect.face?.normal ?? new THREE.Vector3(0, 1, 0)
                )
            ),
            scale: [8, 8, 5],
            texture: newDrop.texture,
        };
        setDecals((prev) => [...prev, decal]);
    }, [newDrop, camera, savedLines]);

    return (
        <>
            <mesh
                ref={cylinderRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <cylinderGeometry args={[50, 50, 100, 32, 1]} />
                <meshStandardMaterial attach="material-0" color="white" />
                <meshStandardMaterial attach="material-1" color="lightgray" />
                <meshStandardMaterial attach="material-2" color="lightgray" />
            </mesh>

            {currentPath.length > 1 && (
                <Line
                    points={currentPath}
                    color="black"
                    lineWidth={3}
                />
            )}

            {savedLines.map((path, idx) => {
                if (hiddenLineIndices.has(idx)) {
                    return null;
                }
                return <Line
                    key={idx}
                    points={path}
                    color="black"
                    lineWidth={3}
                />
            })}

            {/* 폐곡선 외부에 드롭된 개별 decal */}
            {decals.map((d, idx) => (
                <DecalItem key={idx} decal={d} meshRef={cylinderRef} />
            ))}

            {/* 폐곡선 내부에 드롭된 masking decal */}
            {dropTextures.map(({ pathIdx, texture }, index) => {
                const path = savedLines[pathIdx];
                if (!path) {
                    return null;
                }
                return <MaskedDecal key={index} currentPath={path} textureUrl={texture} targetMesh={cylinderRef.current!}/>
            })}
        </>
    );
};

