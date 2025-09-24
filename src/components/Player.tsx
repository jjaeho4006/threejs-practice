import {RigidBody, RapierRigidBody, useRapier, CapsuleCollider} from "@react-three/rapier";
import * as THREE from "three";
import {useEffect, useRef, useState} from "react";
import {usePersonControls} from "../hooks/usePersonControls.ts";
import {useFrame} from "@react-three/fiber";
import * as RAPIER from "@dimforge/rapier3d-compat";
import {Weapon} from "./Weapon.tsx";
import * as TWEEN from "@tweenjs/tween.js";

const MOVE_SPEED = 5;

// 매 프레임마다 new THREE.vector3() 하지 않도록 재사용
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const rotation = new THREE.Vector3();

export const Player = () => {

    const playerRef = useRef<RapierRigidBody | null>(null);
    const objectInHandRef = useRef<THREE.Object3D | null>(null);
    const swayingObjectRef = useRef<THREE.Object3D | null>(null);

    const [swayingAnimation, setSwayingAnimation] = useState<TWEEN.Tween<THREE.Vector3> | null>(null);
    const [swayingBackAnimation, setSwayingBackAnimation] = useState<TWEEN.Tween<THREE.Vector3> | null>(null);
    const [isSwayingAnimationFinished, setIsSwayingAnimationFinished] = useState<boolean>(true);

    const {forward, backward, left, right, jump} = usePersonControls();

    const rapier = useRapier();



    useFrame((state) => {
        if(!playerRef.current){
            return;
        }

        const velocity = playerRef.current.linvel(); // 플레이어의 현재 선형 속도

        frontVector.set(0,0, Number(backward) - Number(forward)); // 누른 버튼을 기준으로 전진/후진 모션 벡터 설정
        sideVector.set(Number(left) - Number(right), 0,0); // 왼쪽/오른쪽 이동 벡터 설정
        // 이동 벡터를 빼고 결과 정규화(벡터 길이 1 X), 이동 속도 상수 곱해서 플레이어 이동의 최종 벡터 계산
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(MOVE_SPEED).applyEuler(state.camera.rotation);

        // 플레이어 개체를 깨워 변경 사항에 반응하는지 확인, 이 방법 사용하지 않으면 일정 시간이 지나면 개체가 잠자기 상태가 되어 위치 변경에 반응 X
        playerRef.current.wakeUp();
        // 계산된 이동 방향을 기반으로 플레이어의 새로운 선형 속도를 설정하고 현재 수직속도를 유지(점프나 추락에 영향 주지 않도록)
        playerRef.current.setLinvel({x: direction.x, y: velocity.y, z: direction.z}, false);

        // jumping
        const world = rapier.world;
        const ray = new RAPIER.Ray(playerRef.current.translation(), {x: 0, y: -1, z: 0});
        const hit = world.castRay(ray, 1.1, true);
        const grounded = !!hit && hit.collider && Math.abs(hit.timeOfImpact) <= 1.5;

        if(jump && grounded){
            doJump();
        }

        // moving camera
        const {x, y, z} = playerRef.current.translation();
        state.camera.position.set(x, y, z);

        objectInHandRef.current?.rotation.copy(state.camera.rotation);
        objectInHandRef.current?.position.copy(state.camera.position).add(state.camera.getWorldDirection(rotation));

        const isMoving = direction.length() > 0;

        if (isMoving && isSwayingAnimationFinished) {
            setIsSwayingAnimationFinished(false);
            swayingAnimation?.start();
        }

    })

    const doJump = () => {
        playerRef.current?.setLinvel({x: 0, y: 5, z: 0}, true);
    }

    const initSwayingObjectAnimation = () => {
        const currentPosition = new THREE.Vector3(0, 0, 0);
        const initialPosition = new THREE.Vector3(0, 0, 0);
        const newPosition = new THREE.Vector3(-0.05, 0, 0);
        const animationDuration = 300;
        const easing = TWEEN.Easing.Quadratic.Out;

        const twSwayingAnimation = new TWEEN.Tween(currentPosition)
            .to(newPosition, animationDuration)
            .easing(easing)
            .onUpdate(() => {
                swayingObjectRef.current?.position.copy(currentPosition);
            });

        const twSwayingBackAnimation = new TWEEN.Tween(currentPosition)
            .to(initialPosition, animationDuration)
            .easing(easing)
            .onUpdate(() => {
                swayingObjectRef.current?.position.copy(currentPosition);
            })
            .onComplete(() => {
                setIsSwayingAnimationFinished(true);
            });

        twSwayingAnimation.chain(twSwayingBackAnimation);

        setSwayingAnimation(twSwayingAnimation);
        setSwayingBackAnimation(twSwayingBackAnimation);
    }

    useEffect(() => {
        initSwayingObjectAnimation();
    }, []);


    return (
        <>
            <RigidBody position={[0, 1, -2]} mass={1} ref={playerRef} lockRotations>
                <mesh castShadow>
                    <CapsuleCollider args={[0.75, 0.5]} />
                </mesh>
            </RigidBody>
            <group ref={objectInHandRef}>
                <group ref={swayingObjectRef}>
                    <Weapon position={[0.3, -0.1, 0.3]} scale={0.3}/>
                </group>
            </group>
        </>
    )
}