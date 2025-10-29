import * as THREE from "three";

// 선분 클리핑 함수 (경계에 맞게 자르기)
export const clipLineToBounds = (
    startPoint: THREE.Vector3,
    endPoint: THREE.Vector3,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
): THREE.Vector3[] | null => {
    let p0 = startPoint;
    let p1 = endPoint;

    // 수평 및 수직 경계에 대해 클리핑
    if (p0.x < minX && p1.x < minX || p0.x > maxX && p1.x > maxX || p0.y < minY && p1.y < minY || p0.y > maxY && p1.y > maxY) {
        return null; // 라인이 영역 외부에 있으면 잘라내기
    }

    // X축 경계 클리핑
    if (p0.x < minX) {
        const t = (minX - p0.x) / (p1.x - p0.x);
        p0 = new THREE.Vector3(minX, p0.y + t * (p1.y - p0.y), p0.z);
    } else if (p0.x > maxX) {
        const t = (maxX - p0.x) / (p1.x - p0.x);
        p0 = new THREE.Vector3(maxX, p0.y + t * (p1.y - p0.y), p0.z);
    }

    if (p1.x < minX) {
        const t = (minX - p1.x) / (p0.x - p1.x);
        p1 = new THREE.Vector3(minX, p1.y + t * (p0.y - p1.y), p1.z);
    } else if (p1.x > maxX) {
        const t = (maxX - p1.x) / (p0.x - p1.x);
        p1 = new THREE.Vector3(maxX, p1.y + t * (p0.y - p1.y), p1.z);
    }

    // Y축 경계 클리핑
    if (p0.y < minY) {
        const t = (minY - p0.y) / (p1.y - p0.y);
        p0 = new THREE.Vector3(p0.x + t * (p1.x - p0.x), minY, p0.z);
    } else if (p0.y > maxY) {
        const t = (maxY - p0.y) / (p1.y - p0.y);
        p0 = new THREE.Vector3(p0.x + t * (p1.x - p0.x), maxY, p0.z);
    }

    if (p1.y < minY) {
        const t = (minY - p1.y) / (p0.y - p1.y);
        p1 = new THREE.Vector3(p1.x + t * (p0.x - p1.x), minY, p1.z);
    } else if (p1.y > maxY) {
        const t = (maxY - p1.y) / (p0.y - p1.y);
        p1 = new THREE.Vector3(p1.x + t * (p0.x - p1.x), maxY, p1.z);
    }

    // 잘린 선분이 유효하면 반환
    if (p0 !== startPoint || p1 !== endPoint) {
        return [p0, p1];
    }

    return null;
};

export const isLineWithinBounds = (
    startPoint: THREE.Vector3,
    endPoint: THREE.Vector3,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
) => {
    // 라인 상의 두 점이 모두 화면 내에 있는지 확인
    return (
        (startPoint.x >= minX && startPoint.x <= maxX && startPoint.y >= minY && startPoint.y <= maxY) &&
        (endPoint.x >= minX && endPoint.x <= maxX && endPoint.y >= minY && endPoint.y <= maxY)
    );
};
