import * as THREE from "three";
import ThreeObject from "../../object/ThreeObject";
import {clipLineToBounds, isLineWithinBounds} from "./lineUtils";


// 6각형 포인트 생성
const generateHexagonPoints = (
    x: number,
    y: number,
    sideLength: number
): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    const angleStep = (Math.PI * 2) / 6; // 60도씩 6개의 점

    for (let i = 0; i < 6; i++) {
        const x1 = x + Math.cos(i * angleStep) * sideLength;
        const y1 = y + Math.sin(i * angleStep) * sideLength;
        const x2 = x + Math.cos((i + 1) * angleStep) * sideLength;
        const y2 = y + Math.sin((i + 1) * angleStep) * sideLength;

        points.push(new THREE.Vector3(x1, y1, 0));
        points.push(new THREE.Vector3(x2, y2, 0));
    }

    return points;
};

// 6각형 물방울 무늬
export const createHexagonPattern = (
    width: number,
    height: number,
    spacing: number,
    sideLength: number,
    color = 0x0000ff
) => {
    const points: THREE.Vector3[] = [];
    const hexWidth = Math.sqrt(3) * sideLength; // 육각형의 너비
    const hexHeight = 2 * sideLength; // 육각형의 높이

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    let row = 0;
    for (let y = -halfHeight + hexHeight / 2; y <= halfHeight; y += hexHeight + spacing) { // y의 시작 위치 수정
        for (let x = -halfWidth; x <= halfWidth; x += hexWidth + spacing) {
            const xOffset = (row % 2 === 0) ? 0 : hexWidth / 2; // 지그재그 정렬
            const centerX = x + xOffset;

            // 육각형의 모든 꼭짓점 계산
            const hexPoints = generateHexagonPoints(centerX, y, sideLength);

            // 각 육각형의 라인이 화면 내에 있는지 체크
            for (let i = 0; i < hexPoints.length; i++) {
                const startPoint = hexPoints[i];
                const endPoint = hexPoints[(i + 1) % hexPoints.length];

                if (isLineWithinBounds(startPoint, endPoint, -halfWidth, halfWidth, -halfHeight, halfHeight)) {
                    // 박스 안에 있는 선은 바로 넣기
                    points.push(startPoint, endPoint);
                } else {
                    // 걸쳐 있는 라인 잘라내기
                    const clippedLine = clipLineToBounds(startPoint, endPoint, -halfWidth, halfWidth, -halfHeight, halfHeight);
                    if (clippedLine) {
                        points.push(clippedLine[0], clippedLine[1]);
                    }
                }
            }
        }
        row++; // 다음 줄 이동
    }

    return ThreeObject.createLineSegments(points, color)
};


// 십자 포인트 패턴
export const createCrossPattern = (
    width: number,
    height: number,
    spacing: number,
    crossSize: number,
    color = 0x0000ff
) => {
    const points: THREE.Vector3[] = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    for (let row = 0, y = -halfHeight; y <= halfHeight; row++, y += spacing) {
        for (let col = 0, x = -halfWidth; x <= halfWidth; col++, x += spacing) {
            const offsetX = (row % 2) * (spacing / 2); // 홀수 행은 X 위치를 절반 이동
            const centerX = x + offsetX;

            // 십자가가 박스를 넘지 않도록 필터링
            if (
                centerX - crossSize / 2 < -halfWidth || centerX + crossSize / 2 > halfWidth ||
                y - crossSize / 2 < -halfHeight || y + crossSize / 2 > halfHeight
            ) {
                continue;
            }

            // 가로선 추가
            points.push(new THREE.Vector3(centerX - crossSize / 2, y, 0));
            points.push(new THREE.Vector3(centerX + crossSize / 2, y, 0));

            // 세로선 추가
            points.push(new THREE.Vector3(centerX, y - crossSize / 2, 0));
            points.push(new THREE.Vector3(centerX, y + crossSize / 2, 0));
        }
    }

    return ThreeObject.createLineSegments(points, color)
};

// 12각형 별모양
export const createStarPattern = (
    width: number,
    height: number,
    spacing: number,
    innerRadius: number,
    outerRadius: number,
    color = 0x0000ff
) => {
    const points: THREE.Vector3[] = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const angleStep = (Math.PI * 2) / 12; // 360° / 12 = 30° 간격
    const angleOffset = Math.PI / 2;

    for (let x = -halfWidth; x <= halfWidth; x += spacing) {
        for (let y = -halfHeight; y <= halfHeight; y += spacing) {
            const centerX = x + ((y / spacing) % 2) * (spacing / 2); // 지그재그 배치
            const starPoints: THREE.Vector3[] = [];

            for (let i = 0; i < 12; i++) {
                const angle = i * angleStep + angleOffset; // 각도 조정
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const startPoint = centerX + Math.cos(angle) * radius;
                const endPoint = y + Math.sin(angle) * radius;

                starPoints.push(new THREE.Vector3(startPoint, endPoint, 0));
            }

            // 12각 별을 이루는 라인 추가
            for (let i = 0; i < 12; i++) {
                const startPoint = starPoints[i];
                const endPoint = starPoints[(i + 1) % 12];

                if (isLineWithinBounds(startPoint, endPoint, -halfWidth, halfWidth, -halfHeight, halfHeight)) {
                    points.push(startPoint, endPoint);
                } else {
                    const clippedLine = clipLineToBounds(startPoint, endPoint, -halfWidth, halfWidth, -halfHeight, halfHeight);
                    if (clippedLine) {
                        points.push(clippedLine[0], clippedLine[1]);
                    }
                }
            }
        }
    }


    return ThreeObject.createLineSegments(points, color)
};
