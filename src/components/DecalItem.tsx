import React from "react";
import * as THREE from "three";
import {Decal, useTexture} from "@react-three/drei";
import type {DecalDataType} from "../type/type";

interface DecalItemProps {
    decal: DecalDataType;
    meshRef: React.RefObject<THREE.Mesh | null>;
}

export const DecalItem = ({ decal, meshRef }: DecalItemProps) => {
    const texture = useTexture(decal.texture);

    if (!meshRef.current) {
        return null;
    }

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
