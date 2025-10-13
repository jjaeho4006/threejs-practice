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

    const textureMap = decal.texture ? texture : undefined;

    if (!meshRef.current || !decal) {
        return null;
    }

    return (
        <Decal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            map={decal.texture ? textureMap : undefined}
            mesh={meshRef as React.RefObject<THREE.Mesh>}
            renderOrder={1}
        >
            {!decal.texture && (
                <meshStandardMaterial
                    color={0x000000}
                    transparent
                    opacity={0.5}
                />
            )}
        </Decal>
    );
};
