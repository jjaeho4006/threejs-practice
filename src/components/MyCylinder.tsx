import { OrbitControls, Decal, useTexture } from "@react-three/drei";
import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export interface DecalData {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: [number, number, number];
    texture: string;
}

interface DropData {
    texture: string;
    ndcX: number;
    ndcY: number;
}

interface MyCylinderProps {
    newDrop?: DropData;
}

export const MyCylinder: React.FC<MyCylinderProps> = ({ newDrop }) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const [decals, setDecals] = useState<DecalData[]>([]);
    const { camera } = useThree();

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

            const decal: DecalData = {
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
            <mesh ref={cylinderRef}>
                <cylinderGeometry args={[50, 50, 100, 32, 1]} />
                <meshStandardMaterial attach="material-0" color="white" />
                <meshStandardMaterial attach="material-1" color="lightgray" />
                <meshStandardMaterial attach="material-2" color="lightgray" />
            </mesh>

            {decals.map((d, idx) => (
                <DecalItem key={idx} decal={d} meshRef={cylinderRef} />
            ))}

            <OrbitControls enableZoom enablePan enableRotate />
        </>
    );
};

interface DecalItemProps {
    decal: DecalData;
    meshRef: React.RefObject<THREE.Mesh | null>;
}

const DecalItem = ({ decal, meshRef }: DecalItemProps) => {
    const texture = useTexture(decal.texture);

    if (!meshRef.current) return null;

    return (
        <Decal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            map={texture}
            mesh={meshRef as React.RefObject<THREE.Mesh>}
        />
    );
};
