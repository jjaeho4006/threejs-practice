export type PatternTypes = "Diagonal" | "DiagonalRevers" | "DiagonalGrid"
    | "FigureHexagon" | "FigureCross" | "FigureStar"
    | "LineHorizontal" | "LineVertical" | "LineGrid"
    | "WaveHorizontal" | "WaveVertical" | "WaveGrid"
    | "XEqualsX"
;


export interface PatternOption {
    width: number;
    height: number;
    color: number;
    spacing: number; // 간격
    waveAmplitude: number; // 진폭
    waveSpacing: number; // 파동 간격
    figureSize: number;
    starInner: number;
    starOuter: number;
}
