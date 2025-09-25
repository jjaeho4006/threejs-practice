import { Canvas } from "@react-three/fiber";
import { MyCylinder } from "./components/MyCylinder";
import { dirtImage, glassImage, grassImage, logImage, woodImage } from "./assets/images/image";
import React, { useState } from "react";

interface DropData {
    texture: string;
    ndcX: number;
    ndcY: number;
}

const images = [dirtImage, glassImage, grassImage, logImage, woodImage];

export default function App() {
    const [newDrop, setNewDrop] = useState<DropData | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLImageElement>, src: string) => {
        e.dataTransfer.setData("texture", src);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const texture = e.dataTransfer.getData("texture");
        if (texture) {
            const canvas = e.currentTarget.querySelector("canvas")!;
            const rect = canvas.getBoundingClientRect();

            const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            setNewDrop({ texture, ndcX, ndcY });

            setTimeout(() => setNewDrop(null), 10);
        }
    };


    return (
        <div
            style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <div
                style={{
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
                    <MyCylinder newDrop={newDrop ?? undefined} />
                </Canvas>
            </div>
        </div>
    );
}
