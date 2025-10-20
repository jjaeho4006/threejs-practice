import * as THREE from "three";

/**
 * 3D 좌표 -> UV 좌표로 변환(cylinder 전용)
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
export const toUV_Generic = (
    mesh: THREE.Mesh,
    worldPos: THREE.Vector3
): THREE.Vector2 | null => {
    const localPos = mesh.worldToLocal(worldPos.clone());
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const uvAttr = geometry.attributes.uv as THREE.BufferAttribute;
    const index = geometry.index;

    if (!posAttr || !uvAttr) {
        console.error("❌ Missing geometry attributes");
        return null;
    }

    let closestFace = -1;
    let minDist = Infinity;

    const faceCount = index ? index.count / 3 : posAttr.count / 3;
    const v0 = new THREE.Vector3();
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();

    for (let i = 0; i < faceCount; i++) {
        const i0 = index ? index.getX(i * 3) : i * 3;
        const i1 = index ? index.getX(i * 3 + 1) : i * 3 + 1;
        const i2 = index ? index.getX(i * 3 + 2) : i * 3 + 2;

        v0.fromBufferAttribute(posAttr, i0);
        v1.fromBufferAttribute(posAttr, i1);
        v2.fromBufferAttribute(posAttr, i2);

        const center = new THREE.Vector3()
            .add(v0)
            .add(v1)
            .add(v2)
            .divideScalar(3);

        const dist = localPos.distanceTo(center);
        if (dist < minDist) {
            minDist = dist;
            closestFace = i;
        }
    }

    if (closestFace < 0) return null;

    const i0 = index ? index.getX(closestFace * 3) : closestFace * 3;
    const i1 = index ? index.getX(closestFace * 3 + 1) : closestFace * 3 + 1;
    const i2 = index ? index.getX(closestFace * 3 + 2) : closestFace * 3 + 2;

    const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
    const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
    const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i2);
    const uvA = new THREE.Vector2().fromBufferAttribute(uvAttr, i0);
    const uvB = new THREE.Vector2().fromBufferAttribute(uvAttr, i1);
    const uvC = new THREE.Vector2().fromBufferAttribute(uvAttr, i2);

    const bary = computeBarycentric(localPos, vA, vB, vC);

    return new THREE.Vector2(
        uvA.x * bary.x + uvB.x * bary.y + uvC.x * bary.z,
        uvA.y * bary.x + uvB.y * bary.y + uvC.y * bary.z
    );
};


/**
 * Barycentric 좌표 : 삼각형의 세 정점(a, b, c)에 대해 어떤 점 point를 세 정점의 가중치의 합으로 표현하는 방식
 * 가중치는 합이 1이 되고, 모두 0 ~ 1 범위면 점이 삼각형 내부에 있다는 의미
 * 주어진 점의 삼각형에 대한 Barycentric 좌표(u, v, w)를 계산 후 반환
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

    // 내적
    const d00 = v0.dot(v0);
    const d01 = v0.dot(v1);
    const d11 = v1.dot(v1);
    const d20 = v2.dot(v0);
    const d21 = v2.dot(v1);

    const denom = d00 * d11 - d01 * d01;

    if (Math.abs(denom) < 0.0001) {
        // 퇴화된 삼각형(거의 일직선)인 경우 첫 번째 정점 반환
        return { x: 1, y: 0, z: 0 };
    }

    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    const u = 1 - v - w;

    return { x: u, y: v, z: w };
}

/**
 * 경로의 UV 좌표를 기준점(anchor)에 정렬
 * 경로가 원통의 0 ~ 1 u 경계를 넘는 경우, 좌표를 보정
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