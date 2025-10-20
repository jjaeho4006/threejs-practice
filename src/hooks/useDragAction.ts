import React, {type Dispatch, type SetStateAction} from "react";
import type {DropDataType} from "../type/type";

interface Props{
    setNewDrop: Dispatch<SetStateAction<DropDataType | null>>
}

/**
 * React에서 HTML 이미지(드래그 가능한 텍스처)를 드래그 앤 드롭할 때,
 * 드래그 시작 시 texture URL을 dataTransfer에 저장하고
 * 드롭 시 NDC 좌표(-1 ~ 1 범위)로 변환하여 3D 씬(Canvas)에 전달하는 역할
 * 최종적으로 MyCylinder에서 newDrop이 감지되면
 * raycaster를 사용해 실제 3D mesh 상의 드롭 위치를 계산
 * @param setNewDrop 드롭된 데이터(texture, ndcX, ndcY)를 상위로 전달하기 위한 상태 업데이트 함수
 */
export const useDragAction = ({setNewDrop}: Props) => {

    /**
     * HTML 표준 Drag & Drop API의 dataTransfer 객체에 드래그 중인 텍스처(src)를 저장
     */
    const handleDragStart = (e: React.DragEvent<HTMLImageElement>, src: string) => {
        e.dataTransfer.setData("texture", src);
    };

    /**
     * 드롭된 texture 정보를 추출해, 마우스 위치를 WebGL 좌표계(NDC: -1 ~ 1)로 변환하여 상위로 전달
     */
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        // 드래그 시 저장했던 texture 데이터 가져오기
        const texture = e.dataTransfer.getData("texture");
        if (!texture) {
            return;
        }

        // Canvas의 위치 정보를 가져와 마우스 좌표 계산
        const canvas = e.currentTarget.querySelector("canvas")!;
        const rect = canvas.getBoundingClientRect();

        // NDC 좌표 변환 : Three.js에서 Raycaster는 화면 좌표가 아닌 NDC 좌표를 사용
        // x: -1(왼쪽) ~ 1(오른쪽)
        // y: -1(아래) ~ 1(위)
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        setNewDrop({ texture, ndcX, ndcY });

        // 빠른 후속 드롭 처리를 위해 잠시 후 newDrop 초기화
        setTimeout(() => setNewDrop(null), 10);
    };

    return {handleDragStart, handleDrop}
}