import {ITextOptions} from "./types.ts";
import VectorUtils from "../vectorUtils.ts";
import * as THREE from "three";
// @ts-ignore
import { Text } from 'troika-three-text';

class TextFactory {
    static text(options: ITextOptions) {
        const {
            font,
            text,
            fontSize,
            position,
            scaleRate,
            color = 0x000000,
            rotation,
            cache,
            segment = 4
        } = options;

        const newFontSize = scaleRate ? fontSize * scaleRate : fontSize;

        const pos = VectorUtils.applyScale(position, scaleRate);

        const shapes = font!.generateShapes(text, newFontSize);
        const geometry = new THREE.ShapeGeometry(shapes, segment);

        const material = cache
            ? cache[color.toString()] ||= new THREE.MeshBasicMaterial({color, depthWrite: false, depthTest: false})
            : new THREE.MeshBasicMaterial({color});

        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.set(pos.x, pos.y, pos.z);

        if (rotation) {
            textMesh.rotation.z = (rotation * Math.PI) / 180;
        }

        textMesh.userData = {
            isText: true,
            text,
            fontSize: newFontSize,
            rotation, color,
        }

        return textMesh;
    }

    static troikaText(options: ITextOptions) {
        const {
            text,
            fontSize,
            position,
            scaleRate,
            color = 0x000000,
            rotation,
            cache,
        } = options;

        const newFontSize = scaleRate ? fontSize * scaleRate : fontSize;
        const pos = VectorUtils.applyScale(position, scaleRate);

        const textMesh = new Text();
        textMesh.text = text;
        textMesh.fontSize = newFontSize;
        textMesh.position.set(pos.x, pos.y, pos.z);
        textMesh.color = color;
        textMesh.anchorX = 'center';
        textMesh.anchorY = 'middle';

        if (cache) {
            const cacheKey = `troika-text-${color.toString()}`

            const cachedMaterial = cache[cacheKey];
            if (cachedMaterial) {
                textMesh.material = cachedMaterial;
            } else {
                cache[cacheKey] = textMesh.material;
            }
        }

        if (rotation) {
            textMesh.rotation.z = (rotation * Math.PI) / 180;
        }

        textMesh.userData = {
            isText: true,
            text,
            fontSize: newFontSize,
            rotation,
            color,
        };

        textMesh.sync();

        return textMesh;
    }
}

export default TextFactory