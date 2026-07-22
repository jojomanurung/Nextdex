import { AbilityData } from "@interfaces/ability";
import { createBrowseStore } from "@store/createBrowseStore";

export const useAbilityStore = createBrowseStore<AbilityData>("/api/ability");
