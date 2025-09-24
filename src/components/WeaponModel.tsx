import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type {JSX} from "react";

export const WeaponModel = (props: JSX.IntrinsicElements['group'])=> {
    const { nodes, materials } = useGLTF('/weapon.glb')
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_4 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                scale={1.084}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_6 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, 0, 0.177]}
                scale={1.084}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_8 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, -0.285, -0.037]}
                scale={1.118}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_10 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, 0, 0.03]}
                scale={1.084}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_12 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[-0.02, 0, 0.21]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_14 as THREE.Mesh).geometry}
                material={materials.gun_tex}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_16 as THREE.Mesh).geometry}
                material={materials.gun_tex}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_18 as THREE.Mesh).geometry}
                material={materials.gun_tex}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_20 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, 0, -0.46]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_22 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0.107, 0.018, 0.366]}
                rotation={[-0.305, 0, 0]}
                scale={1.09}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_24 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, -0.283, -0.026]}
                scale={1.1}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_26 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, -0.288, 0.512]}
                scale={1.099}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_28 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, -0.273, -0.028]}
                scale={1.084}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_30 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, -0.273, -0.028]}
                scale={1.084}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_32 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, -0.262, 0.004]}
                scale={1.083}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_34 as THREE.Mesh).geometry}
                material={materials.gun_tex}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Object_36 as THREE.Mesh).geometry}
                material={materials.gun_tex}
                position={[0, 0, -0.46]}
            />
        </group>
    )
}

useGLTF.preload('/weapon.glb')
