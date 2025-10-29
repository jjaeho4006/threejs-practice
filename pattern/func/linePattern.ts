import * as THREE from "three";
import ThreeObject from "../../object/ThreeObject";

// 라인 패턴 포인트 생성
export const createLinePatternPoint = (width: number, height: number, spacing: number, isVertical = false) => {
    const points: THREE.Vector3[] = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    if (isVertical) {
        // 세로선 추가
        for (let x = -halfWidth; x <= halfWidth; x += spacing) {
            points.push(
                new THREE.Vector3(x, -halfHeight, 0),
                new THREE.Vector3(x, halfHeight, 0)
            );
        }

    } else {
        // 가로선 추가
        for (let y = -halfHeight; y <= halfHeight; y += spacing) {
            points.push(
                new THREE.Vector3(-halfWidth, y, 0),
                new THREE.Vector3(halfWidth, y, 0)
            );
        }
    }

    return points;
}

export const createLinePattern = (width: number, height: number, spacing: number, isVertical = false, color = 0x0000ff) => {
    const points: THREE.Vector3[] = createLinePatternPoint(width, height, spacing, isVertical)

    return ThreeObject.createLineSegments(points, color)
}

// 라인 격자 패턴 포인트 생성
export const createGridPattern = (width: number, height: number, spacing: number, color = 0x0000ff) => {
    const points: THREE.Vector3[] = [
        ...createLinePatternPoint(width, height, spacing, true),
        ...createLinePatternPoint(width, height, spacing, false),
    ];

    return ThreeObject.createLineSegments(points, color)
}
