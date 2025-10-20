import { Canvas } from "@react-three/fiber";
import { MyCylinder } from "./components/MyCylinder";
import { hatch18, hatch30, hatch36, hatch42, hatch48 } from "./assets/images/image";
import { useState } from "react";
import type {DropDataType} from "./type/type";
import {useDragAction} from "./hooks/useDragAction.ts";
import {OrbitControls} from "@react-three/drei";

const images = [hatch18, hatch30, hatch36, hatch42, hatch48];

export default function App() {
    const [newDrop, setNewDrop] = useState<DropDataType | null>(null);
    const [drawMode, setDrawMode] = useState<boolean>(false);

    const {handleDrop, handleDragStart} = useDragAction({setNewDrop});

    return (
        <div
            style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <button
                style={{ width: "100px", height: "30px", cursor: "pointer", padding: "5px 15px", margin: "5px auto", backgroundColor: "#fff", border: "1px solid #888" }}
                onClick={() => setDrawMode(!drawMode)}
            >
                {drawMode ? "드로잉 중" : "영역 그리기"}
            </button>

            <div style={{
                    width: "80%",
                    height: "200px",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "50px",
                    overflowX: "auto",
                    borderBottom: "2px solid #ddd",
                }}
            >
                {images.map((src, idx) => (
                    <img
                        key={idx}
                        src={src}
                        alt={`image-item-${idx}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, src)}
                        style={{  cursor: "grab" }}
                    />
                ))}
            </div>

            <div style={{ flex: 1, width: "100%" }}>
                <Canvas camera={{ position: [0, 0, 250], fov: 40 }} >
                    {/*환경광: Scene 전체에 균일하게 적용되는 빛*/}
                    <ambientLight intensity={2.5} />

                    {/*점광원: 전구처럼 한 점에서 사방으로 퍼지는 빛 */}
                    <pointLight position={[50, 50, 50]} />
                    {/*<EditorScene url={"/model.json"} drawMode={drawMode} newDrop={newDrop ?? undefined}/>*/}
                    <MyCylinder
                        newDrop={newDrop ?? undefined}
                        drawMode={drawMode}
                    />
                    {/* 마우스 컨트롤 */}
                    {!drawMode && <OrbitControls enableZoom enablePan enableRotate enableDamping/>}
                </Canvas>

            </div>

        </div>
    );
}
