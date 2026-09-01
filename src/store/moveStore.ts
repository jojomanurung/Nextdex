import { MoveData } from "@interfaces/move";
import { createBrowseStore } from "@store/createBrowseStore";

export const useMoveStore = createBrowseStore<MoveData>("/api/move");
