// 물결무늬 포인트 생성
import * as THREE from "three";
import ThreeObject from "../../object/ThreeObject";
import {clipLineToBounds, isLineWithinBounds} from "./lineUtils";

const createWavePoints = (
    width: number,
    height: number,
    spacing: number,
    amplitude: number, // 파도의 높이
    waveSpacing: number, // 진폭 (파도의 너비)
    isVertical = false // 세로 방향 여부
): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // 주파수 계산 (waveSpacing을 기준으로 한 주기 설정)
    const frequency = (Math.PI * 2) / waveSpacing;

    if (isVertical) {
        // 세로 방향 물결 (Y축 기준)
        for (let x = -halfWidth; x <= halfWidth; x += spacing) {
            for (let y = -halfHeight; y < halfHeight; y += spacing) {
                const x1 = x + Math.sin(y * frequency) * amplitude;
                const y1 = y;
                const x2 = x + Math.sin((y + spacing) * frequency) * amplitude;
                const y2 = y + spacing;

                points.push(new THREE.Vector3(x1, y1, 0));
                points.push(new THREE.Vector3(x2, y2, 0));
            }
        }
    } else {
        // 가로 방향 물결 (X축 기준)
        for (let y = -halfHeight; y <= halfHeight; y += spacing) {
            for (let x = -halfWidth; x < halfWidth; x += spacing) {
                const x1 = x;
                const y1 = y + Math.sin(x * frequency) * amplitude;
                const x2 = x + spacing;
                const y2 = y + Math.sin((x + spacing) * frequency) * amplitude;

                points.push(new THREE.Vector3(x1, y1, 0));
                points.push(new THREE.Vector3(x2, y2, 0));
            }
        }
    }

    const wavePoints: THREE.Vector3[] = []
    for (let i = 0; i < points.length - 1; i++) {
        const startPoint = points[i];
        const endPoint = points[i + 1];

        if (isLineWithinBounds(startPoint, endPoint, -halfWidth, halfWidth, -halfHeight, halfHeight)) {
            wavePoints.push(startPoint, endPoint); // 내부에 완전히 포함된 경우 추가
        } else {
            const clippedLine = clipLineToBounds(startPoint, endPoint, -halfWidth, halfWidth, -halfHeight, halfHeight);
            if (clippedLine) {
                wavePoints.push(clippedLine[0], clippedLine[1]);
            }
        }
    }

    return wavePoints;
};

export const createWavePattern = (
    width: number,
    height: number,
    spacing: number,
    amplitude: number, // 파도의 높이
    waveSpacing: number, // 진폭 (파도의 너비)
    isVertical = false,
    color = 0x0000ff
) => {
    // 포인트 생성 후 적용
    const wavePoints  = createWavePoints(width, height, spacing, amplitude, waveSpacing, isVertical)
    return ThreeObject.createLineSegments(wavePoints , color)
}

// 물결무늬 격자
export const createWaveGridPattern = (
    width: number,
    height: number,
    spacing: number,
    amplitude: number, // 파도의 높이
    waveSpacing: number, // 진폭 (파도의 너비)
    color = 0x0000ff
) => {
    const points = [
        ...createWavePoints(width, height, spacing, amplitude, waveSpacing, true),
        ...createWavePoints(width, height, spacing, amplitude, waveSpacing, false),
    ]

    return ThreeObject.createLineSegments(points, color)
};
