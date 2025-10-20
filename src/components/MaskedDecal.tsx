import * as THREE from "three";
import {useEffect, useMemo, useState} from "react";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import {alignUvsToAnchor, toUV_Cylinder} from "../utils/toUV.ts";
import {getCenterOfPath, getMaxDiameter} from "../utils/decalUtils.ts";
import {loadTextureHighRes} from "../utils/loadTextureHighRes.ts";

interface MaskedDecalProps {
    currentPath: THREE.Vector3[];
    textureUrl: string;
    targetMesh: THREE.Mesh;
    textureWidth: number;
    textureHeight: number;
}

export const MaskedDecal = ({ currentPath, textureUrl, targetMesh, textureWidth, textureHeight }: MaskedDecalProps) => {

    const [baseTexture, setBaseTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        loadTextureHighRes(textureUrl, 1024).then((texture) => {
            texture.wrapT = THREE.RepeatWrapping;
            texture.wrapS = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true
            texture.anisotropy = 16;
            setBaseTexture(texture);
        })

        return () => {
            if(baseTexture) {
                baseTexture.dispose();
            }
        }
    }, [textureUrl]);

    const decalData = useMemo(() => {
        if (!targetMesh || currentPath.length < 3) {
            return null;
        }

        const center = getCenterOfPath(currentPath);
        const diameter = getMaxDiameter(currentPath);

        // DecalGeometry 생성
        const geometry = new DecalGeometry(
            targetMesh,
            center,
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(diameter, diameter, diameter)
        );

        // 폐곡선을 UV 좌표로 변환
        const pathUVs = currentPath.map(toUV_Cylinder);
        const centerUV = toUV_Cylinder(center);
        const alignedPathUVs = alignUvsToAnchor(pathUVs, centerUV.x);

        // UV 범위 계산
        const minU = Math.min(...alignedPathUVs.map(uv => uv.x));
        const maxU = Math.max(...alignedPathUVs.map(uv => uv.x));
        const minV = Math.min(...alignedPathUVs.map(uv => uv.y));
        const maxV = Math.max(...alignedPathUVs.map(uv => uv.y));

        // UV 범위를 실제 3D 크기로 변환
        const cylinderRadius = 50;
        const cylinderHeight = 100;

        // UV 너비/높이를 실제 world 공간 크기로 변환
        const uvWidth = maxU - minU;
        const uvHeight = maxV - minV;
        const worldWidth = uvWidth * 2 * Math.PI * cylinderRadius;
        const worldHeight = uvHeight * cylinderHeight;

        const baseSize = 0.1;

        const tilesX = worldWidth / (textureWidth * baseSize);
        const tilesY = (worldHeight / (textureHeight * baseSize));

        // mask texture 생성
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

        const material = new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: baseTexture },
                maskTexture: { value: maskTexture },
                uvOffset: { value: new THREE.Vector2(minU, minV) },
                uvScale: { value: new THREE.Vector2(maxU - minU, maxV - minV) },
                tileScaleX: { value: tilesX },
                tileScaleY: { value: tilesY },
                imgAspect: { value: textureWidth / textureHeight },
                edgePadding: { value: 0.0119 }
            },
            vertexShader: `
                // 각 정점의 좌표와 UV를 fragment shader 넘김
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
                uniform float tileScaleX;
                uniform float tileScaleY;
                uniform float edgePadding; // 이미지 테두리 여백
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                // 3D 좌표를 원통 좌표계로 변환해서 UV로 매핑하는 함수
                vec2 toUV_Cylinder(vec3 pos) {
                    float cylinderHeight = 100.0;
                    float theta = atan(pos.x, pos.z);
                    float u = (theta + 3.14159265) / (2.0 * 3.14159265);
                    float v = (pos.y + cylinderHeight / 2.0) / cylinderHeight;
                    return vec2(u, v);
                }
                
                void main() {
                    vec2 cylinderUV = toUV_Cylinder(vPosition);
                    
                    // mask texture 좌표 계산
                    vec2 maskUV = (cylinderUV - uvOffset) / uvScale;
                    
                    if (maskUV.x < 0.0 || maskUV.x > 1.0 || maskUV.y < 0.0 || maskUV.y > 1.0) {
                        discard;
                    }
                    
                    // mask sampling(polygon 내부만 허용)
                    vec4 maskColor = texture2D(maskTexture, maskUV);
                    
                    // mask가 검은색이면 버림
                    if (maskColor.r < 0.5) {
                        discard;
                    }
                    
                    // X, Y 각각 다른 타일 스케일 적용
                    vec2 tiledUV = fract(vec2(maskUV.x * tileScaleX, maskUV.y * tileScaleY));
                    
                    // 이미지 여백 제거(edgePadding 값 으로 조정)
                    if (edgePadding > 0.0) {
                        tiledUV = tiledUV * (1.0 - 2.0 * edgePadding) + edgePadding;
                    }
                    
                    // base texture sampling
                    vec4 baseColor = texture2D(baseTexture, tiledUV);
                    
                    // fragment(pixel)의 최종 색상 지정
                    gl_FragColor = vec4(baseColor.rgb, baseColor.a);
                }
            `,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -4
        });

        return { decalGeometry: geometry, decalMaterial: material };
    }, [baseTexture, currentPath, targetMesh, textureHeight, textureWidth]);

    if (!decalData) return null;

    const { decalGeometry, decalMaterial } = decalData;

    return <mesh geometry={decalGeometry} material={decalMaterial} renderOrder={3} />;
};