import React, { useState } from "react";
import { Check, Crown, Plus, Trash2, UserPlus, X } from "lucide-react";
import type { CharacterId, Participant } from "../types/receipt";
import { CHARACTER_LIST, CHARACTER_THEMES } from "../data/characters";
import { CharacterAvatar } from "./CharacterAvatar";

interface CharacterRosterProps {
  participants: Participant[];
  activePainterId: string | null;
  payerId: string;
  onSelectPainter: (id: string | null) => void;
  onSetPayer: (id: string) => void;
  onAddParticipant: (name: string, characterId: CharacterId) => void;
  onRenameParticipant: (id: string, name: string) => void;
  onChangeCharacter: (id: string, characterId: CharacterId) => void;
  onRemoveParticipant: (id: string) => void;
}

export const CharacterRoster: React.FC<CharacterRosterProps> = ({
  participants,
  activePainterId,
  payerId,
  onSelectPainter,
  onSetPayer,
  onAddParticipant,
  onRenameParticipant,
  onChangeCharacter,
  onRemoveParticipant,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCharId, setNewCharId] = useState<CharacterId>("purin");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const theme = CHARACTER_THEMES[newCharId];
    const trimmed = newName.trim() || theme.defaultName;
    onAddParticipant(trimmed, newCharId);
    setNewName("");
    setIsAdding(false);
  };

  const activeFriend = participants.find((p) => p.id === activePainterId);

  return (
    <section
      aria-label="Friends splitting this receipt"
      className="bg-white border border-[#EFE2E7] rounded-2xl p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-[#231B20]">
            Friends Splitting This Bill
          </h2>
          <p className="text-xs text-[#6D5B63] mt-0.5">
            {activeFriend
              ? `Assigning items to ${activeFriend.name} — tap any receipt item below to toggle`
              : "Click a character to enter tap-to-assign mode, or toggle avatars directly on each item"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activePainterId && (
            <button
              type="button"
              onClick={() => onSelectPainter(null)}
              className="px-3 py-1.5 text-xs font-medium text-[#6D5B63] hover:text-[#231B20] bg-[#FAF3F5] rounded-lg transition-colors whitespace-nowrap"
            >
              Exit Tap Mode
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#881337] bg-[#FFF0F3] hover:bg-[#FFE4E9] rounded-lg transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {/* Add Friend Inline Bar */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-4 p-3.5 rounded-xl bg-[#FFF9FB] border border-[#EFE2E7] flex flex-wrap items-center gap-3"
        >
          <div className="flex items-center gap-1.5">
            {CHARACTER_LIST.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => setNewCharId(char.id)}
                title={char.defaultName}
                aria-label={`Select ${char.defaultName} character`}
                className="p-0.5 rounded-full focus-visible:outline-2 focus-visible:outline-[#E11D48]"
              >
                <CharacterAvatar
                  characterId={char.id}
                  size="sm"
                  active={newCharId === char.id}
                />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Name (default: ${CHARACTER_THEMES[newCharId].defaultName})`}
            className="flex-1 min-w-[160px] px-3 py-1.5 text-sm bg-white border border-[#E6CED6] rounded-lg text-[#231B20] focus:outline-none focus:border-[#E11D48]"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              aria-label="Cancel adding friend"
              className="p-1.5 text-[#6D5B63] hover:text-[#231B20]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Character Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {participants.map((p) => {
          const isPainter = activePainterId === p.id;
          const isPayer = payerId === p.id;
          const theme = CHARACTER_THEMES[p.characterId] ?? CHARACTER_THEMES.kitty;
          const isEditing = editingId === p.id;

          return (
            <div
              key={p.id}
              className={`group relative rounded-xl p-3 border transition-colors ${
                isPainter
                  ? "bg-[#FFF5F7] border-[#E11D48]"
                  : "bg-[#FFFDFC] border-[#EFE2E7] hover:border-[#DFC6D0]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectPainter(isPainter ? null : p.id)}
                  className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
                  title={
                    isPainter
                      ? `Stop assigning to ${p.name}`
                      : `Click to tap-assign items to ${p.name}`
                  }
                >
                  <CharacterAvatar
                    characterId={p.characterId}
                    size="md"
                    active={isPainter}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={p.name}
                        autoFocus
                        onChange={(e) => onRenameParticipant(p.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        className="w-full px-2 py-0.5 text-sm font-semibold bg-white border border-[#E11D48] rounded text-[#231B20] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectPainter(isPainter ? null : p.id)}
                      onDoubleClick={() => setEditingId(p.id)}
                      className="text-left w-full"
                      title="Click to assign items, double-click to rename"
                    >
                      <div className="text-sm font-semibold text-[#231B20] truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[#6D5B63] truncate">
                        {isPainter ? "Tap items to assign" : theme.title}
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Footer: Payer Toggle, Avatar Cycle, Edit/Remove */}
              <div className="mt-2.5 pt-2 border-t border-[#F4EAEE] flex items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => onSetPayer(p.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors whitespace-nowrap ${
                    isPayer
                      ? "bg-[#231B20] text-white"
                      : "text-[#6D5B63] hover:text-[#231B20] hover:bg-[#FAF3F5]"
                  }`}
                >
                  <Crown className="w-3 h-3" aria-hidden="true" />
                  <span>{isPayer ? "Paid Bill" : "Mark Payer"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : p.id)}
                    className="px-1.5 py-0.5 text-[#6D5B63] hover:text-[#231B20] rounded transition-colors"
                    title="Rename friend"
                  >
                    {isEditing ? <Check className="w-3 h-3" /> : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = CHARACTER_LIST.findIndex(
                        (c) => c.id === p.characterId
                      );
                      const next =
                        CHARACTER_LIST[(idx + 1) % CHARACTER_LIST.length];
                      onChangeCharacter(p.id, next.id);
                    }}
                    className="px-1.5 py-0.5 text-[#6D5B63] hover:text-[#231B20] rounded transition-colors"
                    title="Switch Hello Kitty character"
                  >
                    Icon
                  </button>
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveParticipant(p.id)}
                      aria-label={`Remove ${p.name}`}
                      className="p-0.5 text-[#9A858F] hover:text-[#DC2626] rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
