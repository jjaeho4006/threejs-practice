declare module 'three/examples/jsm/geometries/DecalGeometry' {
    import * as THREE from 'three';

    export class DecalGeometry extends THREE.BufferGeometry {
        constructor(
            mesh: THREE.Mesh,
            position: THREE.Vector3,
            orientation: THREE.Euler,
            size: THREE.Vector3
        );
    }
}