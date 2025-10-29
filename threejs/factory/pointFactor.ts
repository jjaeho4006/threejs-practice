import {IPointOptions} from "./types.ts";
import VectorUtils from "../vectorUtils.ts";
import PointUtils from "../pointUtils.ts";
import * as THREE from "three";

class PointFactor {
    static point({position, size, color = 0x000000, scaleRate, cache}: IPointOptions) {
        const pos = VectorUtils.applyScale(position, scaleRate)
        const geometry = PointUtils.createFloat32BufferGeometry([pos])

        const cacheKey = `point-${color.toString()}-${size}`

        const material = cache
            ? cache[cacheKey] ||= new THREE.PointsMaterial({size, color})
            : new THREE.PointsMaterial({size, color});

        return new THREE.Points(geometry, material);
    }
}

export default PointFactor