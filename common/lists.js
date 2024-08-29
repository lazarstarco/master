export const isTypeItem = (t1, t2, i) => {
  const itemTypeMap = new Map([
    ["Black Belt", "fighting"],
    ["Black Glasses", "dark"],
    ["Charcoal", "fire"],
    ["Dragon Fang", "dragon"],
    ["Hard Stone", "rock"],
    ["Magnet", "electric"],
    ["Metal Coat", "steel"],
    ["Miracle Seed", "grass"],
    ["Mystic Water", "water"],
    ["Never-Melt Ice", "ice"],
    ["Pink Bow", "normal"],
    ["Poison Barb", "poison"],
    ["Polkadot Bow", "normal"],
    ["Sharp Beak", "flying"],
    ["Silver Powder", "bug"],
    ["Soft Sand", "ground"],
    ["Spell Tag", "ghost"],
    ["Twisted Spoon", "psychic"],
  ]);
  const itemType = itemTypeMap.get(i);
  return itemType === t1 || itemType === t2;
};

export const TYPE_ITEMS = {
  BLACK_BELT: "Black Belt",
  BLACK_GLASSES: "Black Glasses",
  CHARCOAL: "Charcoal",
  DRAGON_FANG: "Dragon Fang",
  HARD_STONE: "Hard Stone",
  MAGNET: "Magnet",
  METAL_COAT: "Metal Coat",
  MIRACLE_SEED: "Miracle Seed",
  MYSTIC_WATER: "Mystic Water",
  NEVER_MELT_ICE: "Never-Melt Ice",
  PINK_BOW: "Pink Bow",
  POISON_BARB: "Poison Barb",
  POLKADOT_BOW: "Polkadot Bow",
  SHARP_BEAK: "Sharp Beak",
  SILVER_POWDER: "Silver Powder",
  SOFT_SAND: "Soft Sand",
  SPELL_TAG: "Spell Tag",
  TWISTED_SPOON: "Twisted Spoon",
};
