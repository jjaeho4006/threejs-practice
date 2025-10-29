import * as THREE from 'three';
import {IPoint} from "../types.ts";
import {Font} from 'three/addons/loaders/FontLoader.js';

type MaterialCacheType = Record<string, THREE.Material>

interface ICommonOptions {
    color?: number;
    scaleRate?: number;
    cache?: MaterialCacheType
}

export interface ICircleOptions extends ICommonOptions {
    center: IPoint | THREE.Vector3;
    radius: number;
    linewidth?: number;
    segmentCount?: number;
}

export interface IArcOptions extends ICommonOptions {
    center: IPoint | THREE.Vector3;
    radius: number;
    arcStart: number;
    arcEnd: number;
    segmentCount?: number;
}

export interface IRingOptions extends ICommonOptions {
    center: IPoint | THREE.Vector3;
    radius: number;
    width: number;
    thetaSegments?: number;
}

export interface ILineOptions extends ICommonOptions {
    points: IPoint[] | THREE.Vector3[];
    linewidth?: number,
}

export interface ITextOptions extends ICommonOptions {
    font?: Font;
    text: string;
    fontSize: number;
    position: IPoint | THREE.Vector3;
    segment?: number;
    rotation?: number;
}

export interface IPointOptions extends ICommonOptions {
    position: IPoint | THREE.Vector3;
    size: number;
}

export interface IEllipseOptions extends ICommonOptions {
    center: IPoint | THREE.Vector3;
    xrad: number,
    yrad: number,
    startAngle: number,
    endAngle: number,
    rotation?: number;
}
