export const getSvgSize = async(url: string): Promise<{width: number; height: number} | null> => {
    try{
        const res = await fetch(url);
        const text = await res.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "image/svg+xml");
        const svg = xml.querySelector('svg');

        if(!svg){
            return null;
        }

        const width = svg.getAttribute('width');
        const height = svg.getAttribute('height');

        // 단위 제거
        if(width && height){
            return {
                width: parseFloat(width),
                height: parseFloat(height)
            }
        }

        // width / height 없으면 viewBox 사용
        const viewBox = svg.getAttribute('viewBox');
        if(viewBox){
            const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
            return {
                width: vbWidth, height: vbHeight
            }
        }

        return null;
    }
    catch(error){
        console.error("❌ SVG 파싱 실패: ", error);
        return null;
    }
}