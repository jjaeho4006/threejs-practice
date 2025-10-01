import { Canvas } from "@react-three/fiber";
import { MyCylinder } from "./components/MyCylinder";
import { dirtImage, glassImage, grassImage, logImage, woodImage } from "./assets/images/image";
import { useState } from "react";
import type {DropDataType} from "./type/type";
import {useDragAction} from "./hooks/useDragAction.ts";

const images = [dirtImage, glassImage, grassImage, logImage, woodImage];

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
                        style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "grab" }}
                    />
                ))}
            </div>

            <div style={{ flex: 1, width: "100%" }}>
                <Canvas camera={{ position: [0, 0, 250], fov: 40 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[50, 50, 50]} />
                    <MyCylinder
                        newDrop={newDrop ?? undefined}
                        drawMode={drawMode}
                    />
                </Canvas>
            </div>

        </div>
    );
}
