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