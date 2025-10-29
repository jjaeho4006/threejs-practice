// 사선 패턴 포인트 생성
import * as THREE from "three";
import ThreeObject from "../../object/ThreeObject";

export const createDiagonalPatternPoints = (width: number, height: number, spacing: number, isReversed = false) => {
    const points = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const maxIndex = Math.ceil((width + height) / spacing);

    for (let i = -Math.ceil(height / spacing); i <= maxIndex; i++) {
        let x1 = isReversed ? halfWidth : -halfWidth;
        let y1 = i * spacing - halfHeight;
        let x2 = isReversed ? -halfWidth : halfWidth;
        let y2 = y1 + width;

        if (y1 < -halfHeight) {
            x1 += isReversed ? -(-halfHeight - y1) : (-halfHeight - y1);
            y1 = -halfHeight;
        }
        if (y2 > halfHeight) {
            x2 += isReversed ? (y2 - halfHeight) : -(y2 - halfHeight);
            y2 = halfHeight;
        }

        if ((isReversed && x1 > -halfWidth && x2 < halfWidth) || (!isReversed && x1 < halfWidth && x2 > -halfWidth)) {
            points.push(new THREE.Vector3(x1, y1, 0));
            points.push(new THREE.Vector3(x2, y2, 0));
        }
    }

    return points
};

// 사선 패턴 생성
export const createDiagonalPattern = (width: number, height: number, spacing: number, isReversed = false, color = 0x0000ff) => {
    const points = createDiagonalPatternPoints(width, height, spacing, isReversed);

    return ThreeObject.createLineSegments(points, color)
};

// 사선 격자 패턴
export const createDiagonalGridPattern = (width: number, height: number, spacing: number, color = 0x0000ff) => {
    const points: THREE.Vector3[] = [
        ...createDiagonalPatternPoints(width, height, spacing, true),
        ...createDiagonalPatternPoints(width, height, spacing, false),
    ];

    return ThreeObject.createLineSegments(points, color)
};
