import type {PatternOption, PatternTypes} from "./types";
import {createDiagonalGridPattern, createDiagonalPattern} from "./func/diagonalPattern";
import {createCrossPattern, createHexagonPattern, createStarPattern} from "./func/figurePattern";
import {createGridPattern, createLinePattern} from "./func/linePattern";
import {createWaveGridPattern, createWavePattern} from "./func/wavePattern";
import {createXEqualsXPattern} from "./func/xEqualsXPattern";

class ThreePattern {
    static create(type: PatternTypes, options: PatternOption) {
        const {
            width,
            height,
            spacing = 10,
            color = 0x000000,
            figureSize,
            starOuter,
            starInner,
            waveSpacing,
            waveAmplitude
        } = options
        if (!(width && height)) {
            throw new Error(`width, height는 필수 입니다.'`)
        }

        switch (type) {
            // 사선 패턴
            case "Diagonal":
                return createDiagonalPattern(width, height, spacing, false, color)

            case "DiagonalRevers":
                return createDiagonalPattern(width, height, spacing, true, color)

            case "DiagonalGrid":
                return createDiagonalGridPattern(width, height, spacing, color)

            // 도형 패펀
            case "FigureHexagon":
                if (!figureSize) throw new Error("'FigureHexagon'패턴은 'figureSize'값이 필수 입니다.")
                return createHexagonPattern(width, height, spacing, figureSize, color)

            case "FigureCross":
                if (!figureSize) throw new Error("'FigureCross'패턴은 'figureSize'값이 필수 입니다.")
                return createCrossPattern(width, height, spacing, figureSize, color)

            case "FigureStar":
                if (!(starInner && starOuter)) throw new Error("'FigureStar'패턴은 'starInner', 'starOuter'값이 필수 입니다.")
                return createStarPattern(width, height, spacing, starInner, starOuter, color)

            // 직선 패턴
            case "LineHorizontal":
                return createLinePattern(width, height, spacing, false, color)

            case "LineVertical":
                return createLinePattern(width, height, spacing, true, color)

            case "LineGrid":
                return createGridPattern(width, height, spacing, color)

            // 물결 패턴
            case "WaveHorizontal":
                if (!(waveAmplitude && waveSpacing)) throw new Error("'WaveHorizontal'패턴은 'waveAmplitude', 'waveSpacing'값이 필수 입니다.")
                return createWavePattern(width, height, spacing, waveAmplitude, waveSpacing, false, color)
            case "WaveVertical":
                if (!(waveAmplitude && waveSpacing)) throw new Error("'WaveVertical'패턴은 'waveAmplitude', 'waveSpacing'값이 필수 입니다.")
                return createWavePattern(width, height, spacing, waveAmplitude, waveSpacing, true, color)
            case "WaveGrid":
                if (!(waveAmplitude && waveSpacing)) throw new Error("'WaveGrid'패턴은 'waveAmplitude', 'waveSpacing'값이 필수 입니다.")
                return createWaveGridPattern(width, height, spacing, waveAmplitude, waveSpacing, color)
            
            // 기타
            case "XEqualsX": // X===X 패턴
                return createXEqualsXPattern(width, height, color)

            default:
                throw new Error(`지원하지 않는 패턴 타입 입니다. '${type}'`)
        }
    }
}

export default ThreePattern
