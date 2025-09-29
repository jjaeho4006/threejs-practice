import type {DecalData} from "./MyCylinder.tsx";
import React from "react";
import * as THREE from "three";
import {Decal, useTexture} from "@react-three/drei";

interface DecalItemProps {
    decal: DecalData;
    meshRef: React.RefObject<THREE.Mesh | null>;
}

export const DecalItem = ({ decal, meshRef }: DecalItemProps) => {
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
