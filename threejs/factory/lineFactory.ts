import {ILineOptions} from "./types.ts";
import {Line2} from 'three/addons/lines/Line2.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {LineMaterial} from "three/addons/lines/LineMaterial.js";
import PointUtils from "../pointUtils.ts";
import VectorUtils from "../vectorUtils.ts";
import {IPoint} from "../types.ts";
import * as THREE from "three";

class LineFactory {
    static line({points, color = 0x000000, linewidth = 1, scaleRate, cache}: ILineOptions) {
        const scaledPoints = points.map(it => VectorUtils.applyScale(it, scaleRate));

        const geometry = new LineGeometry();
        geometry.setPositions(PointUtils.createFloat32Array(scaledPoints));

        const material = cache
            ? cache[`${color.toString()}-${linewidth}`] ||= new LineMaterial({linewidth, color})
            : new LineMaterial({linewidth, color});

        return new Line2(geometry, material as LineMaterial);
    }

    static lineSegments(points: IPoint[] | THREE.Vector3[], color: number) {
        const geometry = PointUtils.createFloat32BufferGeometry(points)

        const material = new THREE.LineBasicMaterial({color});
        return new THREE.LineSegments(geometry, material);
    }

    static outline(target: THREE.Mesh, color: number, linewidth = 1) {
        const edgesGeometry = new THREE.EdgesGeometry(target.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({color, linewidth});

        return new THREE.LineSegments(edgesGeometry, edgesMaterial);
    }
}

export default LineFactory;