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
 * 특정 3D 공간 상의 점 (worldPos)이 주어졌을 때,
 * 해당 점이 포함된 mesh의 표면 기준 UV 좌표를 근사적으로 구하는 함수
 */
export const toUV_Generic = (mesh: THREE.Mesh, worldPos: THREE.Vector3):THREE.Vector2 | null=> {
    const localPos = mesh.worldToLocal(worldPos);

    // BufferGeometry가 아니면 처리 불가
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const geoAttr = geometry.attributes;
    if(!geometry || !geoAttr.position || !geoAttr.uv){
        console.error('❌ Geometry missing required attributes:', {
            hasPosition: !!geoAttr.position,
            hasUV: !!geoAttr.uv
        });
        return null;
    }

    const uvAttr = geoAttr.uv as THREE.BufferAttribute;

    // 추가
    const posAttr = geoAttr.position as THREE.BufferAttribute;

    let closestFaceIndex = -1;
    let minDist = Infinity;

    const index = geometry.index;
    const faceCount = index ? index.count / 3 : posAttr.count / 3;

    for(let i = 0; i < faceCount; i ++){
        const i0 = index ? index.getX(i * 3) : i * 3;
        const i1 = index ? index.getX(i * 3 + 1) : i * 3 + 1;
        const i2 = index ? index.getX(i * 3 + 2) : i * 3 + 2;

        const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
        const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
        const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);

        // 삼각형 중심점까지의 거리
        const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);

        const dist = localPos.distanceTo(center);
        if(dist < minDist){
            minDist = dist;
            closestFaceIndex = i;
        }
    }

    if(closestFaceIndex === -1){
        console.error('no face found');
        return null;
    }

    // 가장 가까운 면의 인덱스
    const i0 = index ? index.getX(closestFaceIndex * 3) : closestFaceIndex * 3;
    const i1 = index ? index.getX(closestFaceIndex * 3 + 1) : closestFaceIndex * 3 + 1;
    const i2 = index ? index.getX(closestFaceIndex * 3 + 2) : closestFaceIndex * 3 + 2;

    const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
    const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
    const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);

    const uv0 = new THREE.Vector2().fromBufferAttribute(uvAttr, i0);
    const uv1 = new THREE.Vector2().fromBufferAttribute(uvAttr, i1);
    const uv2 = new THREE.Vector2().fromBufferAttribute(uvAttr, i2);

    // Barycentric 좌표 계산
    const bary = computeBarycentric(localPos, v0, v1, v2);

    // UV 보간
    const uv = new THREE.Vector2();
    uv.x = uv0.x * bary.x + uv1.x * bary.y + uv2.x * bary.z;
    uv.y = uv0.y * bary.x + uv1.y * bary.y + uv2.y * bary.z;

    console.log('🗺️ UV computed:', {
        closestFaceIndex,
        minDist,
        bary,
        uv
    });

    return uv;


}


/**
* Barycentric 좌표 계산
*/
const computeBarycentric = (
    point: THREE.Vector3,
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
): { x: number; y: number; z: number } => {
    const v0 = b.clone().sub(a);
    const v1 = c.clone().sub(a);
    const v2 = point.clone().sub(a);

    const d00 = v0.dot(v0);
    const d01 = v0.dot(v1);
    const d11 = v1.dot(v1);
    const d20 = v2.dot(v0);
    const d21 = v2.dot(v1);

    const denom = d00 * d11 - d01 * d01;

    if (Math.abs(denom) < 0.0001) {
        // 퇴화된 삼각형인 경우 첫 번째 정점 반환
        return { x: 1, y: 0, z: 0 };
    }

    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    const u = 1 - v - w;

    return { x: u, y: v, z: w };
}

/**
 * 경로의 UV 좌표를 기준점(anchor)에 정렬
 * 경로가 원통의 0~1 u 경계를 넘어가는 경우, 좌표를 보정
 */
export const alignUvsToAnchor = (uvs: THREE.Vector2[], anchorU: number): THREE.Vector2[] => {
    return uvs.map((uv) => {
        let u = uv.x;
        if(u - anchorU > 0.5){
            u -= 1
        }
        else if(anchorU - u > 0.5){
            u += 1;
        }
        return new THREE.Vector2(u, uv.y);
    })
}