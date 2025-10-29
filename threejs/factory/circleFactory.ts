import VectorUtils from "../vectorUtils.ts";
import {IArcOptions, ICircleOptions, IRingOptions} from "./types.ts";
import * as THREE from "three";
import {Line2} from 'three/addons/lines/Line2.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {LineMaterial} from "three/addons/lines/LineMaterial.js";
import PointUtils from "../pointUtils.ts";

class CircleFactory {
    static circleFill({center, radius, scaleRate, color = 0x000000}: ICircleOptions) {
        const centerVector = VectorUtils.applyScale(center, scaleRate)
        radius = scaleRate ? radius * scaleRate : radius;

        const geometry = new THREE.CircleGeometry(radius, 32);
        const material = new THREE.MeshBasicMaterial({color});

        const circleMesh = new THREE.Mesh(geometry, material);
        circleMesh.position.copy(centerVector);

        circleMesh.userData.radius = radius;

        return circleMesh;
    }

    static circle(options: ICircleOptions) {
        const {
            center,
            radius,
            scaleRate = undefined,
            color = 0x000000,
            cache,
            linewidth = 1,
            segmentCount = 32
        } = options

        const centerVector = VectorUtils.applyScale(center, scaleRate)
        const newRadius = scaleRate ? radius * scaleRate : radius;

        const positions = new Float32Array((segmentCount + 1) * 3);  // 3D 좌표이므로 3배 크기

        // 원의 좌표 계산 (Vector3 객체 없이 직접 Float32Array에 저장)
        for (let i = 0; i <= segmentCount; i++) {
            const angle = (i / segmentCount) * Math.PI * 2; // 원의 각도
            positions[i * 3] = Math.cos(angle) * newRadius;  // x
            positions[i * 3 + 1] = Math.sin(angle) * newRadius;  // y
            positions[i * 3 + 2] = 0;  // z는 0
        }

        const geometry = new LineGeometry();
        geometry.setPositions(positions);

        const material = cache
            ? cache[color.toString()] ||= new LineMaterial({color, linewidth})
            : new LineMaterial({color, linewidth});

        const circle = new Line2(geometry, material as LineMaterial);  // 원을 그리기 위해 LineLoop 사용

        // 원의 위치 설정
        circle.position.copy(centerVector)

        circle.userData.radius = newRadius;

        return circle;
    }

    static ring({center, radius, width, color = 0x000000, thetaSegments = 64}: IRingOptions) {
        const innerRadius = radius - width / 2;
        const outerRadius = radius + width / 2;

        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        const material = new THREE.MeshBasicMaterial({color});

        const ring = new THREE.Mesh(geometry, material);
        ring.position.copy(center);

        return ring;
    }

    static arc({center, radius, arcStart, arcEnd, color = 0x000000, scaleRate, cache, segmentCount = 32}: IArcOptions) {
        const centerVector = VectorUtils.applyScale(center, scaleRate)
        radius = scaleRate ? radius * scaleRate : radius;

        const curve = new THREE.ArcCurve(0, 0, radius, arcStart, arcEnd, false);
        const points = curve.getPoints(segmentCount) as unknown as THREE.Vector3[];

        // 원호 좌표 계산 (Vector3 객체 생성 없이 직접 Float32Array에 저장)
        const geometry = PointUtils.createFloat32BufferGeometry(points);
        const material = cache
            ? cache[color.toString()] ||= new THREE.LineBasicMaterial({color})
            : new THREE.LineBasicMaterial({color});

        const arc = new THREE.Line(geometry, material);
        arc.position.copy(centerVector);

        return arc
    }
}

export default CircleFactory;