import * as THREE from "three";

export type DecalDataType =  {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: [number, number, number];
    texture: string;
    isTemporary?: boolean
    path?: THREE.Vector3[];
}

export type DropDataType = {
    texture: string;
    ndcX: number;
    ndcY: number;
}

export type StrokePointType = {
    pos: THREE.Vector3;
    normal: THREE.Vector3;
    size: number;
    color: string;
    id: string;
}

export type StrokeType = {
    id: string;
    points: StrokePointType[];
    closed: boolean;
}

declare module 'three' {
    interface MeshStandardMaterialParameters {
        stencilWrite?: boolean;
        stencilRef?: number;
        stencilFunc?: number;
        stencilMask?: number;
    }
}