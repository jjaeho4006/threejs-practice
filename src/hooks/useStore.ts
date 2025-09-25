import { nanoid } from "nanoid";
import { create } from "zustand";

type Cube = {
    key: string;
    position: [number, number, number];
    texture: "dirt" | "log" | "grass" | "glass" | "wood";
};

export type StoreState = {
    texture: "dirt" | "log" | "grass" | "glass" | "wood";
    cubes: Cube[];
    addCube: (x: number, y: number, z: number) => void;
    removeCube: (x: number, y: number, z: number) => void;
    setTexture: (texture: "dirt" | "log" | "grass" | "glass" | "wood") => void;
    saveWorld: () => void;
    resetWorld: () => void;
};

const getLocalStorage = (key: string) => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
};
const setLocalStorage = (key: string, value: Cube[]) => (window.localStorage.setItem(key, JSON.stringify(value)));

export const useStore = create<StoreState>((set) => ({
    texture: "dirt",
    cubes: getLocalStorage("cubes") || [],
    addCube: (x, y, z) =>
        set((prev) => ({
            cubes: [
                ...prev.cubes,
                {
                    key: nanoid(),
                    position: [x, y, z],
                    texture: prev.texture,
                },
            ],
        })),
    removeCube:(x, y, z) =>
        set((prev) => ({
           cubes: prev.cubes.filter(cube => {
               const [X,Y,Z] = cube.position
               return X !== x || Y !== y || Z !== z
           })
        })),
    setTexture: (texture: "dirt" | "log" | "grass" | "glass" | "wood") => set(() => ({ texture })),
    saveWorld: () => {
        const cubes = useStore.getState().cubes;
        setLocalStorage("cubes", cubes);
    },
    resetWorld: () => set(() => ({ cubes: [] })),
}));
