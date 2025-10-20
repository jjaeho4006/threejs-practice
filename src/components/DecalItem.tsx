import React, {useEffect, useState} from "react";
import * as THREE from "three";
import {Decal} from "@react-three/drei";
import type {DecalDataType} from "../type/type";
import {loadTextureHighRes} from "../utils/loadTextureHighRes.ts";

interface DecalItemProps {
    decal: DecalDataType;
    meshRef: React.RefObject<THREE.Mesh | null>;
}

export const DecalItem = ({ decal, meshRef }: DecalItemProps) => {
    const [baseTexture, setBaseTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        loadTextureHighRes(decal.texture, 2048).then((texture) => {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            texture.anisotropy = 16;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.needsUpdate = true;

            setBaseTexture(texture);
        })

        return () => {
            if(baseTexture) {
                baseTexture.dispose();
            }
        }
    }, [decal.texture]);

    if (!meshRef.current || !decal || !baseTexture) {
        return null;
    }

    return (
        <Decal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            map={baseTexture ?? undefined}
            mesh={meshRef as React.RefObject<THREE.Mesh>}
            renderOrder={1}
        />
    );
};
