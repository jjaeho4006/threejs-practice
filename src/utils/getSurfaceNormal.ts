import * as THREE from "three";

/**
 * 클릭한 위치에서 메시 표면 법선(mesh surface normal) 가져오기
 * 메시 표면 법선 : 3D 공간에서 표면의 방향을 알려주는 단위 벡터(길이는 항상 1)
 * 표면 위의 한 점에서 "표면의 직각 방향"을 나타냄
 */
export const getSurfaceNormal = (mesh: THREE.Mesh, hitPoint: THREE.Vector3) => {
    mesh.updateMatrixWorld(true);
    const inverseMatrix = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
    const localPoint = hitPoint.clone().applyMatrix4(inverseMatrix);

    const positionAttr = mesh.geometry.attributes.position;
    const normalAttr = mesh.geometry.attributes.normal;

    let closestIndex = 0;
    let minDistance = Infinity;

    for(let i = 0; i < positionAttr.count; i ++){
        const v = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
        const dist = v.distanceTo(localPoint);
        if(dist < minDistance){
            minDistance = dist;
            closestIndex = i;
        }
    }

    const normal = new THREE.Vector3().fromBufferAttribute(normalAttr, closestIndex);
    normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)).normalize();

    return normal;
};