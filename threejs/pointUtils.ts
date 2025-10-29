import {IPoint} from "./types.ts";
import * as THREE from "three";

class PointUtils {
    // points 생성
    static createFloat32Array(points: IPoint[] | THREE.Vector3[]) {
        const positions = new Float32Array(points.length * 3);  // 3은 x, y, z 좌표
        points.forEach((point, index) => {
            positions[index * 3] = point.x;
            positions[index * 3 + 1] = point.y;
            positions[index * 3 + 2] = point.z;
        });

        return positions;
    }

    static createFloat32BufferGeometry(points: IPoint[] | THREE.Vector3[]) {
        const positions = this.createFloat32Array(points)

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        return geometry
    }


    static vectorToPoint(vector: THREE.Vector3): IPoint {
        return {
            x: vector.x,
            y: vector.y,
            z: vector.z,
        }
    }
}

export default PointUtils