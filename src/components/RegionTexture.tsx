import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface Props {
    path: THREE.Vector3[];
    textureUrl: string;
    radius: number; // 원통 반지름
}

export const RegionTexture = ({ path, textureUrl, radius }: Props) => {
    const texture = useTexture(textureUrl);

    if(texture){
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping;
    }

    const toUV = (p: THREE.Vector3): THREE.Vector2 => {
        const theta = Math.atan2(p.x, p.z);
        const u = (theta + Math.PI) / (2 * Math.PI);
        const v = (p.y + 50) / 100;
        return new THREE.Vector2(u, v);
    }

    const uvs = path.map(toUV);

    const meanU = (() => {
        let sumX = 0, sumY = 0;
        for(const uv of uvs){
            const ang = uv.x * Math.PI * 2;
            sumX += Math.cos(ang);
            sumY += Math.sin(ang);
        }
        const meanAng = Math.atan2(sumY, sumX);
        let mu = meanAng / (2 * Math.PI);
        if(mu < 0) {
            mu += 1;
        }
        return mu;
    })();

    const alignedUVs = uvs.map((uv) => {
        let u = uv.x;
        if(u - meanU > 0.5){
            u -= 1
        }
        else if(meanU - u > 0.5){
            u += 1;
        }
        return new THREE.Vector2(u, uv.y);
    })

    // 2D Shape 생성
    const shape = new THREE.Shape();
    alignedUVs.forEach((uv, i) => {
        if(i === 0){
            shape.moveTo(uv.x, uv.y);
        }
        else{
            shape.lineTo(uv.x, uv.y);
        }
    })
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);

    const minU = Math.min(...alignedUVs.map((uv) => uv.x));
    const maxU = Math.max(...alignedUVs.map((uv) => uv.x));
    const minV = Math.min(...alignedUVs.map((uv) => uv.y));
    const maxV = Math.max(...alignedUVs.map((uv) => uv.y));

    const uvAttr = new Float32Array(geometry.attributes.position.count * 2);
    for(let i = 0; i < geometry.attributes.position.count; i ++){
        const x = geometry.attributes.position.getX(i);
        const y = geometry.attributes.position.getY(i);

        const u = (x - minU) / (maxU - minU);
        const v = (y - minV) / (maxV - minV);

        uvAttr[i * 2] = u;
        uvAttr[i * 2 + 1] = v;
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvAttr, 2));

    // ShapeGeometry의 position을 다시 원통 좌표계로 변환
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const xShape = posAttr.getX(i);
        const yShape = posAttr.getY(i);

        const u = (xShape - minU) / (maxU - minU);
        const v = (yShape - minV) / (maxV - minV);

        const theta = u * Math.PI * 2 - Math.PI;
        const y = v * 100 - 50;

        const x = radius * Math.sin(theta);
        const z = radius * Math.cos(theta);

        posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    return (
        <mesh geometry={geometry}>
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
        </mesh>
    );
};
