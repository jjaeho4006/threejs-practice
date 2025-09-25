import {dirtImg, grassImg, glassImg, woodImg, logImg} from './images';
import {NearestFilter, RepeatWrapping, TextureLoader} from "three";

const textureLoader = new TextureLoader();

const dirtTexture = textureLoader.load(dirtImg);
const logTexture = textureLoader.load(logImg);
const grassTexture = textureLoader.load(grassImg);
const glassTexture = textureLoader.load(glassImg);
const woodTexture = textureLoader.load(woodImg);
const groundTexture = textureLoader.load(grassImg);

dirtTexture.magFilter = NearestFilter;
logTexture.magFilter = NearestFilter;
grassTexture.magFilter = NearestFilter;
glassTexture.magFilter = NearestFilter;
woodTexture.magFilter = NearestFilter;
groundTexture.magFilter = NearestFilter;
groundTexture.wrapS = RepeatWrapping;
groundTexture.wrapT = RepeatWrapping;
groundTexture.repeat.set(100,100);

export {dirtTexture, logTexture, grassTexture, glassTexture, woodTexture, groundTexture};