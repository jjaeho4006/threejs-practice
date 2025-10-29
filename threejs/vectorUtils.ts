import {IPoint} from "./types.ts";
import * as THREE from 'three';
import {Line2} from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

class VectorUtils {
    // 벡터 비율 조정
    static applyScale(vector: IPoint | THREE.Vector3, scaleRate?: number) {
        return scaleRate
            ? new THREE.Vector3(vector.x * scaleRate, vector.y * scaleRate, vector.z * scaleRate)
            : new THREE.Vector3(vector.x, vector.y, vector.z);
    }


    // points 구하기
    static getLinePoints(line: Line2 | THREE.Mesh, isVector = false, isShape = false) {
        let positions: number[];

        // Line2 (LineGeometry) 처리
        if (line.geometry instanceof LineGeometry) {
            const lineGeometry = line.geometry as LineGeometry;
            // LineGeometry에서 positions 속성으로 직접 접근
            positions = Array.from(lineGeometry.attributes.instanceStart?.array || lineGeometry.attributes.position.array);
        } else {
            // 기존 BufferGeometry 처리
            const bufferGeometry = line.geometry as THREE.BufferGeometry;
            positions = Array.from(bufferGeometry.attributes.position.array);
        }

        // 중복점 제거 로직
        const filteredPositions: number[] = [];
        const epsilon = 1e-10;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            // 첫 번째 점이거나, 이전 점과 다른 경우에만 추가
            if (filteredPositions.length === 0) {
                filteredPositions.push(x, y, z);
            } else {
                const prevX = filteredPositions[filteredPositions.length - 3];
                const prevY = filteredPositions[filteredPositions.length - 2];
                const prevZ = filteredPositions[filteredPositions.length - 1];

                if (Math.abs(x - prevX) > epsilon ||
                    Math.abs(y - prevY) > epsilon ||
                    Math.abs(z - prevZ) > epsilon) {
                    filteredPositions.push(x, y, z);
                }
            }
        }

        // isShape가 true이면 닫힌 도형으로 만들기
        if (isShape && filteredPositions.length >= 6) {
            const firstX = filteredPositions[0];
            const firstY = filteredPositions[1];
            const firstZ = filteredPositions[2];

            const lastX = filteredPositions[filteredPositions.length - 3];
            const lastY = filteredPositions[filteredPositions.length - 2];
            const lastZ = filteredPositions[filteredPositions.length - 1];

            // 첫 점과 마지막 점이 다르면 첫 점을 마지막에 추가하여 닫힌 도형 만들기
            // epsilon을 더 크게 설정하여 부동소수점 오차 해결
            const closeEpsilon = 1e-6;
            if (Math.abs(firstX - lastX) > closeEpsilon ||
                Math.abs(firstY - lastY) > closeEpsilon ||
                Math.abs(firstZ - lastZ) > closeEpsilon) {
                // 오차 범위 밖이면 첫점 추가
                filteredPositions[filteredPositions.length - 3] = firstX;
                filteredPositions[filteredPositions.length - 2] = firstY;
                filteredPositions[filteredPositions.length - 1] = firstZ;
            } else {
                // 오차 안쪽이면
                filteredPositions.push(firstX, firstY, firstZ);
            }
        }

        if (isVector) {
            const vectors: THREE.Vector3[] = [];
            for (let i = 0; i < filteredPositions.length; i += 3) { // filteredPositions 사용으로 변경
                vectors.push(new THREE.Vector3(filteredPositions[i], filteredPositions[i + 1], filteredPositions[i + 2]));
            }
            return vectors;
        }

        return filteredPositions;
    }

    // 특정 위치의 라인의 포인트 구하기
    static getLinePoint(line: Line2, index: number) {
        const positions = this.getLinePoints(line) as number[];
        const pointCount = positions.length / 3;

        let resolvedIndex = index;
        if (index < 0) {
            resolvedIndex = pointCount + index;
        }

        // 유효 범위 검사
        if (resolvedIndex < 0 || resolvedIndex >= pointCount) {
            return null;
        }

        return new THREE.Vector3(
            positions[resolvedIndex * 3],
            positions[resolvedIndex * 3 + 1],
            positions[resolvedIndex * 3 + 2]
        );
    }

    // 라인의 포인트 위치 조절
    static adjustLinePoint(line: Line2, point: THREE.Vector3 | IPoint, index: number, isNew = false) {
        const target = isNew ? line.clone(true) : line

        const positions = this.getLinePoints(target)
        const pointCount = positions.length / 3;

        if (index < 0 || index >= pointCount) {
            console.warn(`Index ${index} is out of bounds.`);
            return;
        }

        // 인덱스 위치에 새로운 좌표 설정
        positions[index * 3] = point.x;
        positions[index * 3 + 1] = point.y;
        positions[index * 3 + 2] = point.z;

        // 변경 사항 적용
        target.geometry.attributes.position.needsUpdate = true;

        return target
    }

    // 벡터 길이 조절
    static adjustLineDistance(startPoint: THREE.Vector3, endPoint: THREE.Vector3, distance: number) {
        const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
        return new THREE.Vector3().copy(endPoint).add(direction.multiplyScalar(distance));
    }

}

export default VectorUtils