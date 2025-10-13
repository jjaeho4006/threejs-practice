import * as THREE from "three";

/**
 * 점이 다각형 내부에 있는지 여부 판별(ray casting algorithm)
 */
export const pointInPolygon = (point: THREE.Vector2, polygon: THREE.Vector2[]): boolean => {
    let inside = false;
    for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y)) && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
        if(intersect){
            inside = !inside;
        }
    }
    return inside;
}

/**
 * 두 선분 (p1, p2), (p3, p4)가 교차하는지 판정
 */
export function checkLineIntersection(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    p4: THREE.Vector3
): { intersect: boolean; point?: THREE.Vector3 } {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) {
        return { intersect: false };
    }

    const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    // 교차점 이 선분 범위 안에 있는지 체크
    if (
        px < Math.min(x1, x2) || px > Math.max(x1, x2) ||
        px < Math.min(x3, x4) || px > Math.max(x3, x4) ||
        py < Math.min(y1, y2) || py > Math.max(y1, y2) ||
        py < Math.min(y3, y4) || py > Math.max(y3, y4)
    ) {
        return { intersect: false };
    }

    return { intersect: true, point: new THREE.Vector3(px, py, p1.z) };
}


export const extractClosedPathFromSelfIntersection = (path: THREE.Vector3[]): THREE.Vector3[] | null => {
    const intersections: {indexA: number, indexB: number, point: THREE.Vector3}[] = []

    for(let i = 0; i < path.length - 1; i ++){
        for(let j = i + 2; j < path.length - 1; j ++){
            const {intersect, point} = checkLineIntersection(path[i], path[i + 1], path[j], path[j + 1])
            if(intersect && point){
                intersections.push({indexA: i, indexB: j, point})
            }
        }
    }
    if(intersections.length === 0){
        return null;
    }

    const first = intersections[0];
    const last = intersections[intersections.length - 1];

    const closedPath = path.slice(first.indexA + 1, last.indexB + 2);
    closedPath[0] = first.point.clone();
    closedPath[closedPath.length - 1] = last.point.clone();

    return closedPath;
}

