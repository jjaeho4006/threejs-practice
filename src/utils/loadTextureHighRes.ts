import * as THREE from 'three';

export const loadTextureHighRes = (url: string, resolution: number = 2048) : Promise<THREE.Texture> => {

    return new Promise((resolve, reject) => {
        const isSVG = url.endsWith('.svg');

        if(isSVG){
            const canvas = document.createElement('canvas');
            canvas.width = resolution;
            canvas.height = resolution;
            const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: true, });

            const img = new Image();
            img.onload = () => {
                // 배경을 투명하게
                ctx?.clearRect(0, 0, resolution, resolution);
                // 고해상도로 SVG 렌더링
                ctx?.drawImage(img, 0,0, resolution, resolution);

                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                texture.premultiplyAlpha = false;
                resolve(texture);
            }
            img.onerror = reject;
            img.src = url;
        }
        else{
            // 일반 이미지는 TextureLoader 사용
            const loader = new THREE.TextureLoader();
            loader.load(url, resolve, undefined, reject)
        }
    })

}