import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import {toUV} from "../utils/common.ts";

interface Props {
    path: THREE.Vector3[];
    textureUrl: string;
    radius: number;
}

/**
 * 사용자가 그린 폐곡선(path) 영역 내부에 텍스처를 입히는 컴포넌트
 * 내부적으로는
 * path를 UV 좌표로 변환 -> 2D Shape 생성 -> UV 맵 재설정 -> 다시 원통 좌표계로 감싸기
 * @param path 원통 표면 위의 경로(사용자가 그린 점들)
 * @param textureUrl 매핑할 텍스처 이미지 URL
 * @param radius 원통 반지름
 */
export const RegionTexture = ({ path, textureUrl, radius }: Props) => {

    const texture = useTexture(textureUrl); // 텍스처 로드

    // 텍스처 반복 / 경계 설정
    if(texture){
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping;
    }



    const uvs = path.map(toUV); // 경로를 UV 좌표로 변환

    /**
     * 원형 좌표(u)가 0~1 경계를 넘어가는 문제 해결
     * 평균 u(중심 각도)를 구해 기준점으로 삼음
     * wrap-around(0.95, 0.05 같은 끊김 보정)
     */
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

    // 각 u 좌표를 평균값 기준으로 정렬 (wrap-around 해결)
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

    /**
     * ShapeGeometry 생성을 위한 2D Shape 구축
     * alignedUVs를 기반으로 2D 도형을 그림
     */
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

    const geometry = new THREE.ShapeGeometry(shape); // ShapeGeometry 생성(2D polygon mesh)

    // UV 좌표 범위 계산 (0~1 정규화를 위함)
    const minU = Math.min(...alignedUVs.map((uv) => uv.x));
    const maxU = Math.max(...alignedUVs.map((uv) => uv.x));
    const minV = Math.min(...alignedUVs.map((uv) => uv.y));
    const maxV = Math.max(...alignedUVs.map((uv) => uv.y));

    /**
     * UV 좌표 속성 재설정
     * ShapeGeometry의 각 vertex마다 UV를 새로 지정
     * 텍스처가 올바르게 매핑되도록 (0~1 범위로 스케일링)
     */
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

    /**
     * 2D 평면 geometry -> 3D cylinder 좌표 변환
     * UV(u,v)를 이용해 다시 원통 표면으로 감쌈)
     */
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const xShape = posAttr.getX(i);
        const yShape = posAttr.getY(i);

        // u, v 정규화(0~1)
        const u = (xShape - minU) / (maxU - minU);
        const v = (yShape - minV) / (maxV - minV);

        // cylinder parameterization
        const theta = u * Math.PI * 2 - Math.PI;
        const y = v * 100 - 50;
        const x = radius * Math.sin(theta);
        const z = radius * Math.cos(theta);

        posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    // 최종적으로 cylinder 곡면 위에 텍스처가 입혀진 shape mesh 반환
    return (
        <mesh geometry={geometry}>
            <meshBasicMaterial
                map={texture}
                side={THREE.FrontSide}
                transparent
            />
        </mesh>
    );
};
