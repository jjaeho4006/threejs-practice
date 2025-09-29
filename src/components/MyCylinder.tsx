import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import {DecalItem} from "./DecalItem.tsx";
import type {DecalDataType, DropDataType} from "../type/type";
import {usePointerAction} from "../hooks/usePointerAction.ts";

interface Props {
    newDrop?: DropDataType;
    drawMode: boolean;
}

export const MyCylinder = ({ newDrop, drawMode }: Props) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const [currentPath, setCurrentPath] = useState<THREE.Vector3[]>([]);
    const [decals, setDecals] = useState<DecalDataType[]>([]);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [currentShape, setCurrentShape] = useState<DecalDataType | null>(null);
    const { camera } = useThree();

    const {handlePointerDown, handlePointerMove, handlePointerUp} = usePointerAction({drawMode, currentShape, setCurrentShape, drawing, setDecals, setDrawing, cylinderRef, currentPath, setCurrentPath});


    // 새로운 drop 감지
    useEffect(() => {
        if (!newDrop || !cylinderRef.current) {
            return;
        }

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(newDrop.ndcX, newDrop.ndcY);
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(cylinderRef.current);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const localPos = cylinderRef.current.worldToLocal(intersect.point.clone());

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
        }
    }, [newDrop, camera]);

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

            {currentShape && <DecalItem decal={currentShape} meshRef={cylinderRef} />}

            {!drawMode && <OrbitControls enableZoom enablePan enableRotate />}
        </>
    );
};

