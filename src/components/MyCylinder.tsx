import {Line, OrbitControls} from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import {useThree} from "@react-three/fiber";
import {DecalItem} from "./DecalItem.tsx";
import type {DecalDataType, DropDataType} from "../type/type";
import {usePointerAction} from "../hooks/usePointerAction.ts";
import {RegionTexture} from "./RegionTexture.tsx";

interface Props {
    newDrop?: DropDataType;
    drawMode: boolean;
}

export const MyCylinder = ({ newDrop, drawMode }: Props) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const [currentPath, setCurrentPath] = useState<THREE.Vector3[]>([]);
    const [savedLines, setSavedLines] = useState<THREE.Vector3[][]>([]);
    const [decals, setDecals] = useState<DecalDataType[]>([]);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [dropTextures, setDropTextures] = useState<{pathIdx: number; texture: string}[]>([])
    const { camera } = useThree();

    const {handlePointerMove, handlePointerUp, handlePointerDown} = usePointerAction({drawMode, drawing, setDrawing, cylinderRef, currentPath, setCurrentPath, setSavedLines})




    // 새로운 drop 감지
    useEffect(() => {
        if (!newDrop || !cylinderRef.current) {
            return;
        }

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(newDrop.ndcX, newDrop.ndcY);
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(cylinderRef.current);
        if (intersects.length === 0) {
            return;
        }

        const intersect = intersects[0];
        const localPos = cylinderRef.current.worldToLocal(intersect.point.clone());

        const toUV = (p: THREE.Vector3): THREE.Vector2 => {
            const theta = Math.atan2(p.x, p.z);
            const u = (theta + Math.PI) / (2 * Math.PI);
            const v = (p.y + 50) / 100;
            return new THREE.Vector2(u, v);
        }

        const alignUvsToAnchor = (uvs: THREE.Vector2[], anchorU: number): THREE.Vector2[] => {
            return uvs.map((uv) => {
                let u = uv.x;
                if(u - anchorU > 0.5){
                    u -= -1
                }
                else if(anchorU - u > 0.5){
                    u += 1;
                }
                return new THREE.Vector2(u, uv.y);
            })
        }

        const pointInPolygon = (point: THREE.Vector2, polygon: THREE.Vector2[]): boolean => {
            let inside = false;
            for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].x, yi = polygon[i].y;
                const xj = polygon[j].x, yj = polygon[j].y;

                const intersect = ((yi > point.y) !== (yj > point.y)) && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
                if(intersect){
                    inside = !inside;
                }
            }
            return inside;
        }

        const dropUV = toUV(localPos);

        let matchedIdx: number | null = null;

        for(let idx = 0; idx < savedLines.length; idx ++){
            const path = savedLines[idx];
            if(path.length < 3){
                continue; // 다각형이 아닌경우 무시
            }

            const pathUVs = path.map(toUV);
            const alignedPathUVs = alignUvsToAnchor(pathUVs, dropUV.x);
            const alignedDropUV = new THREE.Vector2(dropUV.x, dropUV.y);

            if(alignedPathUVs.length > 0){

            }

            if(pointInPolygon(alignedDropUV, alignedPathUVs)){
                matchedIdx = idx;
                break;
            }
        }

        if(matchedIdx !== null){
            setDropTextures((prev) => [...prev, {pathIdx: matchedIdx, texture: newDrop.texture}])
            return;
        }

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

            {decals.map((d, idx) => (
                <DecalItem key={idx} decal={d} meshRef={cylinderRef} />
            ))}

            {currentPath.length > 1 && (
                <Line
                    points={currentPath}
                    color="black"
                    lineWidth={2}
                />
            )}

            {savedLines.map((path, idx) => (
                <line key={idx}>
                    <bufferGeometry
                        attach="geometry"
                        attributes={{
                            position: new THREE.Float32BufferAttribute(
                                path.flatMap((p) => [p.x, p.y, p.z]),
                                3
                            ),
                        }}
                    />
                    <lineBasicMaterial color="black" linewidth={3}/>
                </line>
            ))}

            {dropTextures.map(({ pathIdx, texture }, i) => {
                const path = savedLines[pathIdx];
                if (!path) return null;
                return <RegionTexture key={i} path={path} textureUrl={texture} radius={50}/>;
            })}

            {!drawMode && <OrbitControls enableZoom enablePan enableRotate />}
        </>
    );
};

