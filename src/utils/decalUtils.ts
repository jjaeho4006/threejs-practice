import * as THREE from "three";

/**
 * 폐곡선 중심점 계산
 */
export const getCenterOfPath = (points: THREE.Vector3[]) => {
    const center = new THREE.Vector3();
    points.forEach((p) => center.add(p));
    center.divideScalar(points.length);
    return center;
};

/**
 * 폐곡선 최대 지름 계산
 */
export const getMaxDiameter = (points: THREE.Vector3[]) => {
    let maxDistance = 0;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const distance = points[i].distanceTo(points[j]);
            if (distance > maxDistance) maxDistance = distance;
        }
    }
    return maxDistance;
};