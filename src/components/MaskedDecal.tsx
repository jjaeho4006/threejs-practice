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
        loadTextureHighRes(textureUrl, 2048).then((texture) => {
            texture.wrapT = THREE.RepeatWrapping;
            texture.wrapS = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true
            texture.anisotropy = 8;
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
        const decalEuler = new THREE.Euler(0, 0, 0);
        const geometry = new DecalGeometry(
            targetMesh,
            center,
            decalEuler,
            new THREE.Vector3(diameter * 1.2, diameter * 1.2, diameter * 1.2)
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
        const tilesY = worldHeight / (textureHeight * baseSize);

        // mask texture 생성(canvas에 정확히 fill)
        const canvas = document.createElement('canvas');
        const size = 1024;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        // 고품질 렌더링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 배경 검은색
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, size, size);

        // 폐곡선 영역 흰색으로 채우기(closePath 후 fill)
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
        maskTexture.minFilter = THREE.LinearMipmapLinearFilter;
        maskTexture.magFilter = THREE.LinearFilter;
        maskTexture.generateMipmaps = true;
        maskTexture.needsUpdate = true;

        const material = new THREE.ShaderMaterial({
            // uniforms : 외부에서 전달되는 값
            uniforms: {
                baseTexture: { value: baseTexture },
                maskTexture: { value: maskTexture }, // 마스크 텍스처(폴리곤 영역 정의)
                uvOffset: { value: new THREE.Vector2(minU, minV) }, // 마스크 좌표 시작점(0 ~ 1 UV 기준)
                uvScale: { value: new THREE.Vector2(maxU - minU, maxV - minV) }, // 마스크 영역 크기 (UV 기준)
                tileScaleX: { value: tilesX },
                tileScaleY: { value: tilesY },
                imgAspect: { value: textureWidth / textureHeight },
                edgePadding: { value: 0.008}
            },
            vertexShader: `
                // varying : Vertex Shader -> Fragment Shader로 값 전달
                varying vec2 vUv;       // 모델 UV 좌표
                varying vec3 vPosition; // 모델 공간 상 정점 좌표
                
                void main() {
                    // geometry의 UV 값을 Fragment Shader로 전달
                    vUv = uv;
                    
                    // 모델 좌표(position)를 Fragment Shader로 전달
                    vPosition = position;
                    
                    // gl_Position : 화면에 렌더링 될 좌표
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D baseTexture;
                uniform sampler2D maskTexture;
                uniform vec2 uvOffset; // 마스크 UV 시작점
                uniform vec2 uvScale;  // 마스크 UV 크기
                uniform float tileScaleX;
                uniform float tileScaleY;
                uniform float edgePadding;
                
                // Vertex Shader 에서 전달된 값
                varying vec2 vUv;
                varying vec3 vPosition;
                
                // Cylinder mapping 함수 : 3D 모델 좌표 -> 2D UV 변환
                vec2 toUV_Cylinder(vec3 pos){
                    float cylinderHeight = 100.0;
                    
                    // x-z 평면에서 각도 계산
                    float theta = atan(pos.x, pos.z);
                    
                    // u 좌표 : 0 ~ 1 범위로 정규화
                    float u = (theta + 3.14159265) / (2.0 * 3.14159265);
                    
                    // v 좌표 : y 좌표를 원통 높이 기준으로 정규화
                    float v = (pos.y + cylinderHeight / 2.0) / cylinderHeight;
                    
                    return vec2(u, v); // UV 좌표 반환
                }
                
                void main() {
                    // 모델 좌표 -> 원통 UV 변환
                    vec2 cylinderUV = toUV_Cylinder(vPosition);
                    
                    // 마스크 텍스처 좌표 계산
                    // 마스크 영역만 0 ~ 1 범위로 매핑
                    vec2 maskUV = (cylinderUV - uvOffset) / uvScale;
                    
                    // UV 범위를 벗어나면 해당 픽셀 그리지 않음
                    if (maskUV.x < 0.0 || maskUV.x > 1.0 || maskUV.y < 0.0 || maskUV.y > 1.0) {
                        discard;
                    }
                    
                    // 마스크 샘플링
                    vec4 maskColor = texture2D(maskTexture, maskUV);
                    
                    // maskColor.r < 0.5 : 검은 영역 -> 픽셀 제거
                    if (maskColor.r < 0.5) {
                        discard;
                    }
                    
                    // baseTexture 타일링 처리
                    vec2 tiledUV = fract(vec2(maskUV.x * tileScaleX, maskUV.y * tileScaleY));
                    
                    // 테두리 여백 처리
                    if (edgePadding > 0.0) {
                        tiledUV = tiledUV * (1.0 - 2.0 * edgePadding) + edgePadding;
                    }
                    
                    // baseTexture 샘플링
                    vec4 baseColor = texture2D(baseTexture, tiledUV);
                    
                    // fragment(pixel)의 최종 색상 지정
                    gl_FragColor = vec4(baseColor.rgb, baseColor.a);
                }
            `,
            transparent: true, // alpha 값을 고려해서 투명 처리
            depthTest: true, // 깊이 테스트 사용
            depthWrite: false, // depth buffer에 기록 안함 -> 겹치는 투명 픽셀 문제 방지
            side: THREE.DoubleSide, // 앞 / 뒤 면 모두 렌더링
            polygonOffset: true, // Z-fighting 방지
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -4
        });

        return { decalGeometry: geometry, decalMaterial: material };
    }, [baseTexture, currentPath, targetMesh, textureHeight, textureWidth]);

    if (!decalData) return null;

    const { decalGeometry, decalMaterial } = decalData;

    return <mesh geometry={decalGeometry} material={decalMaterial} renderOrder={3} />;
};