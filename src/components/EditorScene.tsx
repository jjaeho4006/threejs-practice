import {useLoader, useThree} from "@react-three/fiber";
import {ObjectLoader} from "three";
import type {DecalDataType, DropDataType} from "../type/type";
import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {usePointerAction} from "../hooks/usePointerAction.ts";
import {alignUvsToAnchor, toUV_Cylinder, toUV_Generic} from "../utils/common.ts";
import {pointInPolygon} from "../utils/polygonUtils.ts";
import {MaskedDecal} from "./MaskedDecal.tsx";
import {DecalItem} from "./DecalItem.tsx";
import {Line} from "@react-three/drei";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

interface Props{
    url: string;
    newDrop?: DropDataType;
    drawMode: boolean;
}

export const EditorScene = ({url, newDrop, drawMode}: Props) => {
    const loadedScene = useLoader(ObjectLoader, url);
    const targetMeshRef = useRef<THREE.Mesh | null>(null);
    const {camera} = useThree()

    // decal 관련 상태들
    const [currentPath, setCurrentPath] = useState<THREE.Vector3[]>([]);
    const [savedLines, setSavedLines] = useState<THREE.Vector3[][]>([]);
    const [decals, setDecals] = useState<DecalDataType[]>([]);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [dropTextures, setDropTextures] = useState<{pathIdx: number; texture: string}[]>([]);
    const [hiddenLineIndices, setHiddenLineIndices] = useState<Set<number>>(new Set());

    const {handlePointerMove, handlePointerUp, handlePointerDown} = usePointerAction({
        drawMode,
        drawing,
        setDrawing,
        targetMeshRef,
        currentPath,
        setCurrentPath,
        setSavedLines,
    })

    // Scene 로드 후 렌더링 가능한 Mesh 찾기 (개선)
    useEffect(() => {
        if (!loadedScene) return;

        let foundMesh: THREE.Mesh | null = null;

        loadedScene.traverse((child) => {
            // Mesh이면서 geometry와 material이 있는지 확인
            if (child instanceof THREE.Mesh && child.geometry && child.material) {
                // BufferGeometry인지 확인
                let geo = child.geometry as THREE.BufferGeometry;

                if(!geo.attributes.position){
                    return;
                }

                if(!geo.index){
                    try{
                        geo = BufferGeometryUtils.mergeVertices(geo);
                        geo.computeVertexNormals();
                        child.geometry = geo;
                        console.log('✅ Target mesh found:', child.name || 'unnamed', {
                            isBufferGeometry: geo.isBufferGeometry,
                            hasPosition: !!geo.attributes.position,
                            hasIndex: !!geo.index,
                            indexCount: geo.index?.count,
                            vertexCount: geo.attributes.position?.count,
                        });
                    }
                    catch(err) {
                        console.error('geometry fix failed: ', err)
                    }
                }

                if (geo.attributes.position && geo.attributes.uv) {
                    foundMesh = child;
                    console.log('✅ Target mesh found:', child.name, {
                        isBufferGeometry: geo.isBufferGeometry,
                        hasPosition: !!geo.attributes.position,
                        hasIndex: !!geo.index,
                        indexCount: geo.index?.count,
                        vertexCount: geo.attributes.position?.count,
                    });
                }
            }
        });

        if (foundMesh) {
            targetMeshRef.current = foundMesh;
        } else {
            console.error('❌ No valid mesh found in scene');
        }
    }, [loadedScene]);

    // 새로운 drop 감지
    useEffect(() => {
        if (!newDrop || !targetMeshRef.current) {
            if (newDrop && !targetMeshRef.current) {
                console.warn('⚠️ Drop detected but no target mesh available');
            }
            return;
        }

        // 마우스 좌표(NDC 기준)에서 광선 발사
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(newDrop.ndcX, newDrop.ndcY);
        raycaster.setFromCamera(mouse, camera);

        // 원기둥과의 교차점 탐색
        const intersects = raycaster.intersectObject(targetMeshRef.current, true);

        console.log('📍 Raycaster results:', {
            intersectCount: intersects.length,
            firstIntersect: intersects[0] ? {
                point: intersects[0].point,
                distance: intersects[0].distance
            } : null
        });

        if (intersects.length === 0) {
            return;
        }

        // 첫번째 교차점만 사용
        const intersect = intersects[0];
        const worldPos = intersect.point.clone();
        const localPos = targetMeshRef.current.worldToLocal(worldPos.clone());

        const dropUV = toUV_Generic(targetMeshRef.current, localPos);

        if(!dropUV) {
            console.error('❌ Failed to compute UV coordinates');
            return;
        }

        console.log('🗺️ Drop UV:', dropUV);

        let matchedIdx: number | null = null;

        // 저장된 각 선(line)에 대해 드롭이 내부에 있는지 검사
        for(let idx = 0; idx < savedLines.length; idx++){
            const path = savedLines[idx];
            if(path.length < 3){
                continue;
            }

            const pathUVs = path.map(toUV_Cylinder);
            const alignedPathUVs = alignUvsToAnchor(pathUVs, dropUV.x);
            const alignedDropUV = new THREE.Vector2(dropUV.x, dropUV.y);

            console.log(`🔍 Checking path ${idx}:`, {
                pathLength: path.length,
                alignedPathUVs: alignedPathUVs.slice(0, 3),
                alignedDropUV
            });

            // 실제 다각형 내부 판별
            if(pointInPolygon(alignedDropUV, alignedPathUVs)){
                matchedIdx = idx;
                console.log(`✅ Match found in path ${idx}`);
                break;
            }
        }

        // 드롭이 폐곡선 내부에 있으면 해당 경로에 texture 매핑
        if(matchedIdx !== null){
            console.log('🎨 Adding masked decal');
            setDropTextures((prev) => [...prev, {pathIdx: matchedIdx, texture: newDrop.texture}]);
            setHiddenLineIndices((prev) => new Set(prev).add(matchedIdx));
            return;
        }

        // 폐곡선 외부면 개별 decal 객체 추가
        console.log('🎨 Adding individual decal');
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
            {/* 불러온 모델 표시 */}
            <primitive object={loadedScene} />

            {/* 마우스 이벤트 핸들러를 mesh에 바인딩 */}
            {targetMeshRef.current && (
                <mesh
                    geometry={targetMeshRef.current.geometry}
                    position={targetMeshRef.current.position}
                    rotation={targetMeshRef.current.rotation}
                    scale={targetMeshRef.current.scale}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    <meshBasicMaterial transparent opacity={0} />
                </mesh>
            )}

            {/* 드로잉 중 라인 */}
            {currentPath.length > 1 && <Line points={currentPath} color="black" lineWidth={3} />}

            {/* 저장된 라인 */}
            {savedLines.map((path, idx) =>
                hiddenLineIndices.has(idx) ? null : (
                    <Line key={idx} points={path} color="black" lineWidth={3} />
                )
            )}

            {/* 일반 decal */}
            {decals.map((d, idx) => (
                <DecalItem key={idx} decal={d} meshRef={targetMeshRef} />
            ))}

            {/* 마스킹 decal */}
            {dropTextures.map(({ pathIdx, texture }, index) => {
                const path = savedLines[pathIdx];
                if (!path) return null;
                return (
                    <MaskedDecal
                        key={index}
                        currentPath={path}
                        textureUrl={texture}
                        targetMesh={targetMeshRef.current!}
                    />
                );
            })}
        </>
    )
}