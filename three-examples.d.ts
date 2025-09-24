declare module 'three/examples/jsm/loaders/FontLoader' {
    import { Loader } from 'three';

    // Font 타입 직접 정의
    export class Font {
        data: unknown;
    }

    export class FontLoader extends Loader {
        parse(json: unknown): Font;
        load(url: string, onLoad: (font: Font) => void): void;
    }
}

declare module 'three/examples/jsm/geometries/TextGeometry' {
    import { BufferGeometry } from 'three';
    import { Font } from 'three/examples/jsm/loaders/FontLoader';

    export class TextGeometry extends BufferGeometry {
        constructor(text: string, parameters: { font: Font; size?: number; height?: number });
    }
}
