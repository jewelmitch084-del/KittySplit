import type { CharacterId, CharacterTheme } from "../types/receipt";

export const CHARACTER_THEMES: Record<CharacterId, CharacterTheme> = {
  kitty: {
    id: "kitty",
    defaultName: "Kitty",
    title: "Red Bow Host",
    bgTint: "#FFF0F3",
    ringColor: "#E11D48",
    accentHex: "#E11D48",
    textHex: "#881337",
  },
  melody: {
    id: "melody",
    defaultName: "Melody",
    title: "Sakura Sweet",
    bgTint: "#FDF2F8",
    ringColor: "#DB2777",
    accentHex: "#EC4899",
    textHex: "#831843",
  },
  cinnamon: {
    id: "cinnamon",
    defaultName: "Cinnamon",
    title: "Sky Cloud",
    bgTint: "#F0F9FF",
    ringColor: "#0284C7",
    accentHex: "#38BDF8",
    textHex: "#0C4A6E",
  },
  kuromi: {
    id: "kuromi",
    defaultName: "Kuromi",
    title: "Plum Cheeky",
    bgTint: "#F5F3FF",
    ringColor: "#7C3AED",
    accentHex: "#6D28D9",
    textHex: "#4C1D95",
  },
  purin: {
    id: "purin",
    defaultName: "Purin",
    title: "Caramel Beret",
    bgTint: "#FEFCE8",
    ringColor: "#CA8A04",
    accentHex: "#F59E0B",
    textHex: "#713F12",
  },
  pochacco: {
    id: "pochacco",
    defaultName: "Pochacco",
    title: "Sporty Pup",
    bgTint: "#ECFDF5",
    ringColor: "#059669",
    accentHex: "#10B981",
    textHex: "#064E3B",
  },
};

export const CHARACTER_LIST: CharacterTheme[] = Object.values(CHARACTER_THEMES);

export const DEFAULT_PARTICIPANTS = [
  { id: "p-kitty", name: "Kitty", characterId: "kitty" as CharacterId },
  { id: "p-melody", name: "Melody", characterId: "melody" as CharacterId },
  { id: "p-cinnamon", name: "Cinnamon", characterId: "cinnamon" as CharacterId },
  { id: "p-kuromi", name: "Kuromi", characterId: "kuromi" as CharacterId },
];
