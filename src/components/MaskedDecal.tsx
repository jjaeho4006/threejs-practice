'use client';

import * as THREE from "three";
import { useMemo } from "react";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import {toUV} from "../utils/common.ts";

interface MaskedDecalProps {
    currentPath: THREE.Vector3[];
    textureUrl: string;
    targetMesh: THREE.Mesh;
}

export const MaskedDecal = ({ currentPath, textureUrl, targetMesh }: MaskedDecalProps) => {
    const getCenterOfPath = (points: THREE.Vector3[]) => {
        const center = new THREE.Vector3();
        points.forEach((p) => center.add(p));
        center.divideScalar(points.length);
        return center;
    };

    const getMaxDiameter = (points: THREE.Vector3[]) => {
        let maxDistance = 0;
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const distance = points[i].distanceTo(points[j]);
                if (distance > maxDistance) maxDistance = distance;
            }
        }
        return maxDistance;
    };

    // UV 좌표를 기준점에 정렬 (원통 경계 처리)
    const alignUvsToAnchor = (uvs: THREE.Vector2[], anchorU: number): THREE.Vector2[] => {
        return uvs.map((uv) => {
            let u = uv.x;
            if (u - anchorU > 0.5) {
                u -= 1;
            } else if (anchorU - u > 0.5) {
                u += 1;
            }
            return new THREE.Vector2(u, uv.y);
        });
    };

    const decalData = useMemo(() => {
        if (!targetMesh || currentPath.length < 3) return null;

        const center = getCenterOfPath(currentPath);
        const diameter = getMaxDiameter(currentPath);

        // DecalGeometry 생성
        const geometry = new DecalGeometry(
            targetMesh,
            center,
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(diameter, diameter, diameter)
        );

        // 원본 텍스처 로드
        const baseTexture = new THREE.TextureLoader().load(textureUrl);

        // 폐곡선을 UV 좌표로 변환
        const pathUVs = currentPath.map(toUV);
        const centerUV = toUV(center);
        const alignedPathUVs = alignUvsToAnchor(pathUVs, centerUV.x);

        // UV 범위 계산
        const minU = Math.min(...alignedPathUVs.map(uv => uv.x));
        const maxU = Math.max(...alignedPathUVs.map(uv => uv.x));
        const minV = Math.min(...alignedPathUVs.map(uv => uv.y));
        const maxV = Math.max(...alignedPathUVs.map(uv => uv.y));

        // 마스크 텍스처 생성
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        // 배경 검은색
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, size, size);

        // 폐곡선 영역 흰색으로 채우기
        ctx.fillStyle = 'white';
        ctx.beginPath();
        alignedPathUVs.forEach((uv, i) => {
            const x = ((uv.x - minU) / (maxU - minU)) * size;
            const y = (1 - (uv.y - minV) / (maxV - minV)) * size; // Y축 반전
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();

        const maskTexture = new THREE.CanvasTexture(canvas);
        maskTexture.needsUpdate = true;

        // 커스텀 셰이더 머티리얼
        const material = new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: baseTexture },
                maskTexture: { value: maskTexture },
                uvOffset: { value: new THREE.Vector2(minU, minV) },
                uvScale: { value: new THREE.Vector2(maxU - minU, maxV - minV) },
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D baseTexture;
                uniform sampler2D maskTexture;
                uniform vec2 uvOffset;
                uniform vec2 uvScale;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                // 3D 좌표를 원통 UV로 변환
                vec2 toUV(vec3 pos) {
                    float cylinderHeight = 100.0;
                    float theta = atan(pos.x, pos.z);
                    float u = (theta + 3.14159265) / (2.0 * 3.14159265);
                    float v = (pos.y + cylinderHeight / 2.0) / cylinderHeight;
                    return vec2(u, v);
                }
                
                void main() {
                    // DecalGeometry의 월드 좌표를 UV로 변환
                    vec2 cylinderUV = toUV(vPosition);
                    
                    // 마스크 텍스처 좌표 계산
                    vec2 maskUV = (cylinderUV - uvOffset) / uvScale;
                    
                    // 범위 체크
                    if (maskUV.x < 0.0 || maskUV.x > 1.0 || maskUV.y < 0.0 || maskUV.y > 1.0) {
                        discard;
                    }
                    
                    // 마스크 샘플링
                    vec4 maskColor = texture2D(maskTexture, maskUV);
                    
                    // 마스크가 검은색이면 버림
                    if (maskColor.r < 0.5) {
                        discard;
                    }
                    
                    // 베이스 텍스처 샘플링
                    vec4 baseColor = texture2D(baseTexture, vUv);
                    
                    gl_FragColor = vec4(baseColor.rgb, baseColor.a);
                }
            `,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -1,
        });

        return { decalGeometry: geometry, decalMaterial: material };
    }, [currentPath, targetMesh, textureUrl]);

    if (!decalData) return null;

    const { decalGeometry, decalMaterial } = decalData;

    return <mesh geometry={decalGeometry} material={decalMaterial} renderOrder={2} />;
};