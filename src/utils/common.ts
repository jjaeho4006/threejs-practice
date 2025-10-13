import * as THREE from "three";

/**
 * 3D 좌표 -> UV 좌표로 변환(원통 전용)
 * 원통 좌표계를 기준으로 xz 평면의 각도를 u로, y를 v로 매핑
 */
export const toUV_Cylinder = (p: THREE.Vector3): THREE.Vector2 => {
    const cylinderHeight = 100;
    const theta = Math.atan2(p.x, p.z);
    const u = (theta + Math.PI) / (2 * Math.PI);
    const v = (p.y + cylinderHeight / 2) / cylinderHeight; // cylinder 높이 기준 정규화
    return new THREE.Vector2(u, v);
}

/**
 * 경로의 UV 좌표를 기준점(anchor)에 정렬
 * 경로가 원통의 0~1 u 경계를 넘어가는 경우, 좌표를 보정
 */
export const alignUvsToAnchor = (uvs: THREE.Vector2[], anchorU: number): THREE.Vector2[] => {
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