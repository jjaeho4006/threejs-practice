import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { WeaponModel } from "./WeaponModel";
import {type JSX, useCallback, useEffect, useRef, useState} from "react";
import { useFrame } from "@react-three/fiber";

type WeaponProps = JSX.IntrinsicElements['group'];

const recoilAmount = 0.03;
const recoilDuration = 100;
const easing = TWEEN.Easing.Quadratic.Out;

export const Weapon = (props: WeaponProps) => {
    const [recoilAnimation, setRecoilAnimation] = useState<TWEEN.Tween<THREE.Vector3> | null>(null);
    const [recoilBackAnimation, setRecoilBackAnimation] = useState<TWEEN.Tween<THREE.Vector3> | null>(null);
    const [isShooting, setIsShooting] = useState<boolean>(false);
    const weaponRef = useRef<THREE.Group>(null);

    document.addEventListener('mousedown', () => {
        setIsShooting(true);
    });

    document.addEventListener('mouseup', () => {
        setIsShooting(false);
    });

    const generateRecoilOffset = () => {
        return new THREE.Vector3(
            Math.random() * recoilAmount,
            Math.random() * recoilAmount,
            Math.random() * recoilAmount,
        )
    }

    const generateNewPositionOfRecoil = useCallback((currentPosition: THREE.Vector3): THREE.Vector3 => {
        const recoilOffset = generateRecoilOffset();
        return currentPosition.clone().add(recoilOffset);
    },[]);



    const initRecoilAnimation = useCallback(() => {
        const currentPosition = new THREE.Vector3(0, 0, 0);
        const initialPosition = new THREE.Vector3(0, 0, 0);
        const newPosition = generateNewPositionOfRecoil(currentPosition);

        const twRecoilAnimation = new TWEEN.Tween(currentPosition)
            .to(newPosition, recoilDuration)
            .easing(easing)
            .onUpdate(() => {
                weaponRef.current?.position.copy(currentPosition);
            });

        const twRecoilBackAnimation = new TWEEN.Tween(currentPosition)
            .to(initialPosition, recoilDuration)
            .easing(easing)
            .onUpdate(() => {
                weaponRef.current?.position.copy(currentPosition);
            });

        twRecoilAnimation.chain(twRecoilBackAnimation);

        setRecoilAnimation(twRecoilAnimation);
        setRecoilBackAnimation(twRecoilBackAnimation);
    },[generateNewPositionOfRecoil])

    const startShooting = useCallback(() => {
        recoilAnimation?.start();
    },[recoilAnimation])

    useEffect(() => {
        initRecoilAnimation();

        if (isShooting) {
            startShooting();
        }
    }, [initRecoilAnimation, isShooting, startShooting]);

    useFrame(() => {
        TWEEN.update();
        if (isShooting) {
            startShooting();
        }
    });

    return (
        <group {...props}>
            <group ref={weaponRef}>
                <WeaponModel />
            </group>
        </group>
    );
};
