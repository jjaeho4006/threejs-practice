import React, {type Dispatch, type SetStateAction} from "react";
import type {DropDataType} from "../type/type";

interface Props{
    setNewDrop: Dispatch<SetStateAction<DropDataType | null>>
}

export const useDragAction = ({setNewDrop}: Props) => {

    const handleDragStart = (e: React.DragEvent<HTMLImageElement>, src: string) => {
        e.dataTransfer.setData("texture", src);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const texture = e.dataTransfer.getData("texture");
        if (!texture) return;

        const canvas = e.currentTarget.querySelector("canvas")!;
        const rect = canvas.getBoundingClientRect();

        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        setNewDrop({ texture, ndcX, ndcY });
        setTimeout(() => setNewDrop(null), 10);
    };

    return {handleDragStart, handleDrop}
}