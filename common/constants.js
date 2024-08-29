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

export const STATUS = {
  NONE: "none",
  BURN: "burn",
  FREEZE: "freeze",
  PARALYSIS: "paralysis",
  POISON: "poison",
  SLEEP: "sleep",
};

export const TYPE_CHART = {
  normal: {
    name: "normal",
    strongVs: [],
    weakVs: ["rock", "steel"],
    noDamageVs: ["ghost"],
  },
  fighting: {
    name: "fighting",
    strongVs: ["normal", "rock", "steel", "ice", "dark"],
    weakVs: ["flying", "poison", "bug", "psychic"],
    noDamageVs: ["ghost"],
  },
  flying: {
    name: "flying",
    strongVs: ["fighting", "bug", "grass"],
    weakVs: ["rock", "steel", "electric"],
    noDamageVs: [],
  },
  poison: {
    name: "poison",
    strongVs: ["grass"],
    weakVs: ["poison", "ground", "rock", "ghost"],
    noDamageVs: ["steel"],
  },
  ground: {
    name: "ground",
    strongVs: ["poison", "rock", "steel", "fire", "electric"],
    weakVs: ["bug", "grass"],
    noDamageVs: ["flying"],
  },
  rock: {
    name: "rock",
    strongVs: ["flying", "bug", "fire", "ice"],
    weakVs: ["fighting", "ground", "steel"],
    noDamageVs: [],
  },
  bug: {
    name: "bug",
    strongVs: ["grass", "psychic", "dark"],
    weakVs: ["fighting", "flying", "poison", "ghost", "steel", "fire"],
    noDamageVs: [],
  },
  ghost: {
    name: "ghost",
    strongVs: ["ghost", "psychic"],
    weakVs: ["dark"],
    noDamageVs: ["normal"],
  },
  steel: {
    name: "steel",
    strongVs: ["rock", "ice"],
    weakVs: ["steel", "fire", "water", "electric"],
    noDamageVs: [],
  },
  fire: {
    name: "fire",
    strongVs: ["bug", "steel", "grass", "ice"],
    weakVs: ["rock", "fire", "water", "dragon"],
    noDamageVs: [],
  },
  water: {
    name: "water",
    strongVs: ["ground", "rock", "fire"],
    weakVs: ["water", "grass", "dragon"],
    noDamageVs: [],
  },
  grass: {
    name: "grass",
    strongVs: ["ground", "rock", "water"],
    weakVs: ["flying", "poison", "bug", "steel", "fire", "grass", "dragon"],
    noDamageVs: [],
  },
  electric: {
    name: "electric",
    strongVs: ["flying", "water"],
    weakVs: ["grass", "electric", "dragon"],
    noDamageVs: ["ground"],
  },
  psychic: {
    name: "psychic",
    strongVs: ["fighting", "poison"],
    weakVs: ["steel", "psychic"],
    noDamageVs: ["dark"],
  },
  ice: {
    name: "ice",
    strongVs: ["flying", "ground", "grass", "dragon"],
    weakVs: ["steel", "fire", "water", "ice"],
    noDamageVs: [],
  },
  dragon: {
    name: "dragon",
    strongVs: ["dragon"],
    weakVs: ["steel"],
    noDamageVs: [],
  },
  dark: {
    name: "dark",
    strongVs: ["ghost", "psychic"],
    weakVs: ["fighting", "dark"],
    noDamageVs: [],
  },
};

export const BATTLE_STATUS = {
  WIN: "win",
  DRAW: "draw",
  LOSS: "loss",
};

export const isPhysical = (t) => {
  return [
    "normal",
    "fighting",
    "flying",
    "poison",
    "ground",
    "rock",
    "bug",
    "ghost",
    "steel",
  ].includes(t);
};
