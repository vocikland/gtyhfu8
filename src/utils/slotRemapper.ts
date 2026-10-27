/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SmashFighter {
  id: string;
  name: string;
  maxSlots: number; // usually 8 (c00 - c07), or 16 for extended mods
  defaultSlotNames: string[];
}

export const SMASH_3DS_ROSTER: Record<string, SmashFighter> = {
  mario: {
    id: 'mario',
    name: 'Mario',
    maxSlots: 8,
    defaultSlotNames: ['c00: Default Red', 'c01: Striped USA', 'c02: Blue (Jumpman)', 'c03: Fire Mario', 'c04: Wario Colors', 'c05: Waluigi Purple', 'c06: Fire/Green', 'c07: Foreman Spike'],
  },
  sonic: {
    id: 'sonic',
    name: 'Sonic',
    maxSlots: 8,
    defaultSlotNames: ['c00: Default Blue', 'c01: Dark Blue (Shadow)', 'c02: Silver/Cyan', 'c03: Green Bracelet', 'c04: Black Wristbands', 'c05: Yellow Shoes', 'c06: Orange Gold', 'c07: Purple Knuckles'],
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud',
    maxSlots: 8,
    defaultSlotNames: ['c00: FF7 Soldier 1st Class', 'c01: FF7 Indigo', 'c02: FF7 Red Ribbon', 'c03: FF7 Brown', 'c04: Advent Children Black', 'c05: AC Grey Arm', 'c06: AC Red Arm', 'c07: AC Shinra'],
  },
  bayonetta: {
    id: 'bayonetta',
    name: 'Bayonetta',
    maxSlots: 8,
    defaultSlotNames: ['c00: Bayonetta 2 Short Hair', 'c01: B2 Pink Ribbon', 'c02: B2 White Guns', 'c03: B2 Green Gem', 'c04: Bayonetta 1 Long Hair', 'c05: B1 Jeanne Red', 'c06: B1 Blue Gun', 'c07: B1 Rose Gold'],
  },
  fox: {
    id: 'fox',
    name: 'Fox',
    maxSlots: 8,
    defaultSlotNames: ['c00: Default Orange/White', 'c01: Wolf Grey/Black', 'c02: Blue Combat', 'c03: Green Stealth', 'c04: Red Assault', 'c05: Yellow Classic', 'c06: Dark Fox', 'c07: White Star Fox 64'],
  },
  link: {
    id: 'link',
    name: 'Link',
    maxSlots: 8,
    defaultSlotNames: ['c00: Hero Green Tunic', 'c01: Red Goron Tunic', 'c02: Blue Zora Tunic', 'c03: White Lavender Tunic', 'c04: Dark Link', 'c05: Fierce Deity', 'c06: Skyward Sword Casual', 'c07: Ocarina Gold'],
  },
};

/**
 * Detects fighter and costume slot number from a romfs mod path.
 * e.g. "fighter/mario/model/body/c00/" -> { fighter: "mario", slotNumber: 0, slotString: "c00" }
 */
export function detectFighterSlot(path: string): {
  fighter: string | null;
  slotNumber: number;
  slotString: string | null;
} {
  if (!path) return { fighter: null, slotNumber: -1, slotString: null };

  const match = path.match(/fighter\/([a-zA-Z0-9_]+)\/.*?\b(c[0-9]{2})\b/i);
  if (match) {
    const fighter = match[1].toLowerCase();
    const slotString = match[2].toLowerCase();
    const slotNumber = parseInt(slotString.substring(1), 10);
    return { fighter, slotNumber, slotString };
  }

  // Fallback for simple slot references
  const slotMatch = path.match(/\b(c0[0-7])\b/i);
  if (slotMatch) {
    const slotString = slotMatch[1].toLowerCase();
    return {
      fighter: null,
      slotNumber: parseInt(slotString.substring(1), 10),
      slotString,
    };
  }

  return { fighter: null, slotNumber: -1, slotString: null };
}

/**
 * Remaps costume slot in a path to a new slot index.
 * e.g. remapSlotInPath("fighter/mario/model/body/c00/model.mbn", 3)
 * -> "fighter/mario/model/body/c03/model.mbn"
 */
export function remapSlotInPath(path: string, newSlotNumber: number): string {
  if (!path || newSlotNumber < 0 || newSlotNumber > 15) return path;

  const targetSlot = `c${newSlotNumber.toString().padStart(2, '0')}`;
  // Replace c00..c15 with target slot
  return path.replace(/\bc[0-9]{2}\b/gi, targetSlot);
}

/**
 * Finds the first unoccupied costume slot for a fighter given installed mods.
 */
export function findFirstAvailableSlot(
  fighterId: string,
  occupiedSlots: number[],
  maxSlots: number = 8
): number {
  for (let s = 0; s < maxSlots; s++) {
    if (!occupiedSlots.includes(s)) {
      return s;
    }
  }
  return -1; // all slots full
}
