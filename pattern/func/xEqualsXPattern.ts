import * as THREE from "three";
import ThreeObject from "../../object/ThreeObject";

export const createXEqualsXPattern = (
    width: number,
    height: number,
    color = 0x0000ff
) => {
    const points: THREE.Vector3[] = [];

    const isHorizontal = width >= height; // 가로 모드인지 세로 모드인지 자동 감지
    const xSize = Math.min(width, height) * 0.8; // X 크기 = 짧은 변의 30%
    const equalLength = (isHorizontal ? width : height) - xSize * 2; // 가운데 선의 길이
    const gap = xSize * 0.3; // || 또는 = 간격

    const centerX = 0;
    const centerY = 0;

    // X 모양을 만드는 함수
    const createX = (cx: number, cy: number) => {
        return [
            new THREE.Vector3(cx - xSize / 2, cy - xSize / 2, 0),
            new THREE.Vector3(cx + xSize / 2, cy + xSize / 2, 0),

            new THREE.Vector3(cx - xSize / 2, cy + xSize / 2, 0),
            new THREE.Vector3(cx + xSize / 2, cy - xSize / 2, 0),
        ];
    };

    if (isHorizontal) {
        // 가로 모드: X = X
        const xOffset = equalLength / 2 + xSize / 2;

        // 왼쪽 X
        points.push(...createX(centerX - xOffset, centerY));

        // 오른쪽 X
        points.push(...createX(centerX + xOffset, centerY));

        // 가운데 =
        points.push(new THREE.Vector3(centerX - equalLength / 2, centerY - gap, 0));
        points.push(new THREE.Vector3(centerX + equalLength / 2, centerY - gap, 0));

        points.push(new THREE.Vector3(centerX - equalLength / 2, centerY + gap, 0));
        points.push(new THREE.Vector3(centerX + equalLength / 2, centerY + gap, 0));
    } else {
        // 세로 모드: X || X
        const yOffset = equalLength / 2 + xSize / 2;

        // 위쪽 X
        points.push(...createX(centerX, centerY + yOffset));

        // 아래쪽 X
        points.push(...createX(centerX, centerY - yOffset));

        // 가운데 ||
        points.push(new THREE.Vector3(centerX - gap, centerY - equalLength / 2, 0));
        points.push(new THREE.Vector3(centerX - gap, centerY + equalLength / 2, 0));

        points.push(new THREE.Vector3(centerX + gap, centerY - equalLength / 2, 0));
        points.push(new THREE.Vector3(centerX + gap, centerY + equalLength / 2, 0));
    }

    return ThreeObject.createLineSegments(points, color)
};
