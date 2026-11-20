import React from "react";
import type { CharacterId } from "../types/receipt";
import { CHARACTER_THEMES } from "../data/characters";

interface CharacterAvatarProps {
  characterId: CharacterId;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  active?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<CharacterAvatarProps["size"]>, string> = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const INK = "#2D1F24";

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterId,
  size = "md",
  className = "",
  active = false,
}) => {
  const theme = CHARACTER_THEMES[characterId] ?? CHARACTER_THEMES.kitty;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden select-none transition-transform duration-150 ${SIZE_CLASSES[size]} ${className}`}
      style={{
        backgroundColor: theme.bgTint,
        boxShadow: active
          ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${theme.ringColor}`
          : "inset 0 0 0 1px rgba(45, 31, 36, 0.1)",
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {characterId === "kitty" && (
          <g>
            {/* Kitty ears */}
            <path
              d="M15 24 L13 11 Q13 9 16 10 L26 16"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d="M49 24 L51 11 Q51 9 48 10 L38 16"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Head */}
            <ellipse
              cx="32"
              cy="34"
              rx="21"
              ry="17"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="2.4"
            />
            {/* Signature red bow on right ear (viewer's right) */}
            <g transform="translate(43, 15) rotate(14)">
              <ellipse cx="-6" cy="0" rx="5.5" ry="4.5" fill="#E11D48" stroke={INK} strokeWidth="2" />
              <ellipse cx="6" cy="0" rx="5.5" ry="4.5" fill="#E11D48" stroke={INK} strokeWidth="2" />
              <circle cx="0" cy="0" r="3.2" fill="#FB7185" stroke={INK} strokeWidth="2" />
            </g>
            {/* Eyes */}
            <ellipse cx="22.5" cy="35" rx="2.1" ry="2.7" fill={INK} />
            <ellipse cx="41.5" cy="35" rx="2.1" ry="2.7" fill={INK} />
            {/* Yellow oval nose */}
            <ellipse cx="32" cy="38.5" rx="2.8" ry="2" fill="#FACC15" stroke={INK} strokeWidth="1.6" />
            {/* Whiskers */}
            <path d="M9 32 L15.5 33 M8 36.5 L15 36.5 M9.5 41 L16 39.5" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
            <path d="M55 32 L48.5 33 M56 36.5 L49 36.5 M54.5 41 L48 39.5" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
          </g>
        )}

        {characterId === "melody" && (
          <g>
            {/* Left upright pink bunny ear, right slightly flopped ear */}
            <path
              d="M21 20 C18 8 25 5 28 15 L29 20"
              fill="#F472B6"
              stroke={INK}
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
            <path
              d="M37 19 C38 8 46 8 49 16 C51 22 46 25 43 22"
              fill="#F472B6"
              stroke={INK}
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
            {/* Pink hood */}
            <ellipse cx="32" cy="35" rx="20" ry="17" fill="#F472B6" stroke={INK} strokeWidth="2.4" />
            {/* Inner white face */}
            <ellipse cx="32" cy="37.5" rx="14.5" ry="12" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
            {/* Tiny white daisy flower on hood */}
            <g transform="translate(21, 22)">
              <circle cx="0" cy="-2.5" r="2.2" fill="#FFFFFF" stroke={INK} strokeWidth="1.2" />
              <circle cx="2.5" cy="0" r="2.2" fill="#FFFFFF" stroke={INK} strokeWidth="1.2" />
              <circle cx="0" cy="2.5" r="2.2" fill="#FFFFFF" stroke={INK} strokeWidth="1.2" />
              <circle cx="-2.5" cy="0" r="2.2" fill="#FFFFFF" stroke={INK} strokeWidth="1.2" />
              <circle cx="0" cy="0" r="1.8" fill="#FACC15" />
            </g>
            {/* Eyes, cheeks, nose */}
            <ellipse cx="25.5" cy="36.5" rx="2" ry="2.5" fill={INK} />
            <ellipse cx="38.5" cy="36.5" rx="2" ry="2.5" fill={INK} />
            <ellipse cx="21.5" cy="40.5" rx="2.6" ry="1.4" fill="#FDA4AF" />
            <ellipse cx="42.5" cy="40.5" rx="2.6" ry="1.4" fill="#FDA4AF" />
            <ellipse cx="32" cy="39.5" rx="2.1" ry="1.5" fill="#FACC15" stroke={INK} strokeWidth="1.3" />
            <path d="M30 43 Q32 45 34 43" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}

        {characterId === "cinnamon" && (
          <g>
            {/* Long floppy cloud puppy ears */}
            <path
              d="M14 29 C6 31 5 44 12 45 C16 46 18 39 17 34"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
            <path
              d="M50 29 C58 31 59 44 52 45 C48 46 46 39 47 34"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
            {/* Fluffy head */}
            <ellipse cx="32" cy="34" rx="18.5" ry="15" fill="#FFFFFF" stroke={INK} strokeWidth="2.4" />
            {/* Sky-blue eyes & rosy cheeks */}
            <ellipse cx="23.5" cy="34" rx="2.2" ry="2.7" fill="#0284C7" />
            <ellipse cx="40.5" cy="34" rx="2.2" ry="2.7" fill="#0284C7" />
            <ellipse cx="19.5" cy="38.5" rx="3.4" ry="2" fill="#FDA4AF" />
            <ellipse cx="44.5" cy="38.5" rx="3.4" ry="2" fill="#FDA4AF" />
            {/* Cute w-mouth */}
            <path d="M29 38.5 Q30.5 40.5 32 38.5 Q33.5 40.5 35 38.5" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
            {/* Pastel sky-blue neck ribbon */}
            <g transform="translate(32, 50)">
              <path d="M-7 -3 L0 0 L-7 3 Z" fill="#7DD3FC" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M7 -3 L0 0 L7 3 Z" fill="#7DD3FC" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="0" cy="0" r="2.2" fill="#38BDF8" stroke={INK} strokeWidth="1.5" />
            </g>
          </g>
        )}

        {characterId === "kuromi" && (
          <g>
            {/* Jester pointed ears */}
            <path
              d="M17 24 L11 9 Q15 7 24 17"
              fill="#3B2D4A"
              stroke={INK}
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
            <path
              d="M47 24 L53 9 Q49 7 40 17"
              fill="#3B2D4A"
              stroke={INK}
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="9" r="2.4" fill="#F472B6" stroke={INK} strokeWidth="1.5" />
            <circle cx="53" cy="9" r="2.4" fill="#F472B6" stroke={INK} strokeWidth="1.5" />
            {/* Plum-charcoal hood */}
            <ellipse cx="32" cy="35" rx="19.5" ry="16.5" fill="#3B2D4A" stroke={INK} strokeWidth="2.4" />
            {/* Scalloped inner white face */}
            <path
              d="M17 37 C17 28 26 26 32 29 C38 26 47 28 47 37 C47 45 40 49 32 49 C24 49 17 45 17 37 Z"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="2"
            />
            {/* Pink heart emblem on forehead */}
            <path
              d="M32 24 C30.5 21 27.5 22 28.5 24.5 C29.5 26.5 32 27.8 32 27.8 C32 27.8 34.5 26.5 35.5 24.5 C36.5 22 33.5 21 32 24 Z"
              fill="#FB7185"
            />
            {/* Mischievous eyes + pink nose + cheeky smile */}
            <ellipse cx="25" cy="36.5" rx="2.1" ry="2.6" fill={INK} />
            <path d="M22.5 34.2 L27 35.5" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="39" cy="36.5" rx="2.1" ry="2.6" fill={INK} />
            <path d="M41.5 34.2 L37 35.5" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="32" cy="39.5" rx="2" ry="1.4" fill="#F472B6" />
            <path d="M29 43 Q32 45.2 35 42.5" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
          </g>
        )}

        {characterId === "purin" && (
          <g>
            {/* Floppy golden ears */}
            <path
              d="M15 28 C9 30 8 42 13 43 C17 43 18 36 17 32"
              fill="#FDE047"
              stroke={INK}
              strokeWidth="2.3"
            />
            <path
              d="M49 28 C55 30 56 42 51 43 C47 43 46 36 47 32"
              fill="#FDE047"
              stroke={INK}
              strokeWidth="2.3"
            />
            {/* Plump golden head */}
            <ellipse cx="32" cy="36" rx="19" ry="15.5" fill="#FDE047" stroke={INK} strokeWidth="2.4" />
            {/* Cocoa-brown beret hat */}
            <ellipse cx="32" cy="20.5" rx="12" ry="5.5" fill="#78350F" stroke={INK} strokeWidth="2.2" />
            <path d="M32 15 L32 12" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
            {/* Eyes, rosy cheeks & puppy mouth */}
            <circle cx="24" cy="35" r="2.1" fill={INK} />
            <circle cx="40" cy="35" r="2.1" fill={INK} />
            <ellipse cx="20" cy="39" rx="2.6" ry="1.5" fill="#FCA5A5" />
            <ellipse cx="44" cy="39" rx="2.6" ry="1.5" fill="#FCA5A5" />
            <ellipse cx="32" cy="37.5" rx="2.1" ry="1.5" fill="#78350F" />
            <path d="M29 40.5 Q30.5 42.5 32 40.5 Q33.5 42.5 35 40.5" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {characterId === "pochacco" && (
          <g>
            {/* Black floppy puppy ears */}
            <path
              d="M15 26 C8 28 7 41 13 42 C16 42 18 35 17 30"
              fill="#27272A"
              stroke={INK}
              strokeWidth="2.2"
            />
            <path
              d="M49 26 C56 28 57 41 51 42 C48 42 46 35 47 30"
              fill="#27272A"
              stroke={INK}
              strokeWidth="2.2"
            />
            {/* Top hair tufts */}
            <path d="M29 19 L27 13 M32 18 L32 12 M35 19 L37 13" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
            {/* White puppy head */}
            <ellipse cx="32" cy="34" rx="18" ry="15.5" fill="#FFFFFF" stroke={INK} strokeWidth="2.4" />
            {/* Eyes & black nose */}
            <ellipse cx="25" cy="33" rx="2" ry="2.5" fill={INK} />
            <ellipse cx="39" cy="33" rx="2" ry="2.5" fill={INK} />
            <ellipse cx="32" cy="37.5" rx="2.8" ry="2" fill={INK} />
            <path d="M29.5 42 Q32 44 34.5 42" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
            {/* Sporty red collar */}
            <path d="M22 48.5 Q32 52 42 48.5" fill="none" stroke="#EF4444" strokeWidth="4.2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </span>
  );
};
