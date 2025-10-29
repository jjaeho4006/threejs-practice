import * as THREE from "three";
import {IPoint} from "../types.ts";

class MeshFactory {
    static mesh(points: THREE.Vector3[], color: number, cache?: Record<string, THREE.Material>) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        const material = cache
            ? cache[color.toString()] ||= new THREE.MeshBasicMaterial({color})
            : new THREE.MeshBasicMaterial({color});

        return new THREE.Mesh(geometry, material)
    }

    static box(pos: IPoint | THREE.Vector3, width: number, height: number, color = 0x000000) {
        const boxGeometry = new THREE.BoxGeometry(width, height, 0);
        const boxMaterial = new THREE.MeshBasicMaterial({color});

        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.copy(pos)

        return boxMesh;
    }

    static cone(pos: IPoint | THREE.Vector3, coneRadius: number, coneHeight: number, lookAt: THREE.Vector3, color = 0x000000) {
        const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({color});
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);

        cone.position.copy(pos)

        const direction = new THREE.Vector3().subVectors(lookAt, pos).normalize();
        const up = new THREE.Vector3(0, 1, 0); // 원뿔의 기본 방향(Y축)
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cone.quaternion.copy(quaternion);

        return cone
    }


}

export default MeshFactory