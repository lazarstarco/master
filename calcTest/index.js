import fs from "fs/promises";
import Pokedex from "pokedex-promise-v2";

const P = new Pokedex();

const getTypeChart = async () => {
  const tc = {};
  for (const name of typeNames) {
    const currentType = await P.getTypeByName(name);
    tc[name] = {
      name: name,
      strongVs: currentType.damage_relations.double_damage_to.map(
        (t) => t.name
      ),
      weakVs: currentType.damage_relations.half_damage_to.map((t) => t.name),
      noDamageVs: currentType.damage_relations.no_damage_to.map((t) => t.name),
    };
  }
  return tc;
};

const getTypeChartFromFile = async () => {
  try {
    const data = await fs.readFile("../common/typeChart.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading the file:", err);
    throw err;
  }
};

// const types = await P.getTypesList();
// const typeNames = types.results.map((type) => type.name).splice(0, 18);
// const fireType = await P.getTypeByName("fire");
// const typeChart = getTypeChart();
// console.log(typeNames);
// console.log(fireType.damage_relations);
// console.log(typeChart);

// const typeChart = await getTypeChartFromFile();
// console.log(typeChart["fire"]);

const calculateDamage = async (pokemon, move, opponent) => {
  if (move.power == null) {
    return 0;
  }
  const isCrit = Math.floor(Math.random() * 10000) < 664; // 664 is a random factor in gen 2

  const isPhysical = (t) => {
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

  const isTypeItem = (t1, t2, i) => {
    const is = [
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
    ];
    return (
      is.map((x) => x[0]).includes(i) &&
      (is.map((x) => x[1]).includes(t1) || is.map((x) => x[1]).includes(t2))
    );
  };

  const getTripleKickCount = () => {
    let val = 1;
    if (Math.random() <= 0.333) {
      val = 2;

      if (Math.random() <= 0.333) {
        val = 3;
      }
    }
    return val;
  };

  const calculateTypeEffectiveness = async (mt, t1, t2) => {
    const tc = await getTypeChartFromFile();
    let m = 1.0;

    let t = tc[mt];

    if (t.strongVs.includes[t1]) {
      m *= 2;
    } else if (t.weakVs.includes[t1]) {
      m *= 0.5;
    } else if (t.noDamageVs.includes[t1]) {
      m *= 0;
    }

    if (t2) {
      if (t.strongVs.includes[t2]) {
        m *= 2;
      } else if (t.weakVs.includes[t2]) {
        m *= 0.5;
      } else if (t.noDamageVs.includes[t2]) {
        m *= 0;
      }
    }

    return m;
  };

  const level = pokemon.level;
  const power = move.power;
  const attack = isPhysical(move.type)
    ? pokemon.stats["attack"]
    : pokemon.stats["special-attack"];
  const defense = isPhysical(move.type)
    ? opponent.defense
    : opponent.specialDefense;
  const item = isTypeItem(pokemon.type1, pokemon.type2, pokemon.item) ? 1.1 : 1;
  const critical =
    !isCrit || ["Flail", "Reversal", "Future Sight"].includes(move.name)
      ? 1
      : 2;
  const tk = (move.name = "Triple Kick" ? getTripleKickCount() : 1);
  const weather = 1; // simplified
  const badge = 1; // simplified
  const STAB = pokemon.types.includes(move.type) ? 1.5 : 1;
  const typeEffectiveness = ["Struggle", "Future Sight", "Beat Up"].includes(
    move.name
  )
    ? 1
    : await calculateTypeEffectiveness(
        move.type,
        opponent.type1,
        opponent.type2
      );
  const moveMod = 1; // simplified
  const random = (
    (Math.floor(Math.random() * (255 - 217 + 1)) + 217) /
    255
  ).toFixed(2);
  const doubleDamage = 1; // simplified
  console.log(
    level,
    power,
    attack,
    defense,
    item,
    critical,
    tk,
    weather,
    badge,
    STAB,
    typeEffectiveness,
    moveMod,
    random,
    doubleDamage
  );
  return Math.floor(
    (((((2 * level) / 5 + 2) * power * attack) / defense / 50) *
      item *
      critical +
      2) *
      tk *
      weather *
      badge *
      STAB *
      typeEffectiveness *
      moveMod *
      random *
      doubleDamage
  );
};

const pokemon = {
  name: "charmander",
  level: 50,
  types: ["fire"],
  stats: {
    hp: 114,
    attack: 72,
    defense: 63,
    "special-attack": 80,
    "special-defense": 70,
    speed: 85,
  },
  moves: [
    {
      name: "thunder-punch",
      type: "electric",
      power: 75,
      accuracy: 100,
      pp: 15,
      priority: 0,
      damage_class: "physical",
      effect_chance: 10,
      ailment: { name: "paralysis", chance: 10 },
      category: "damage+ailment",
    },
    {
      name: "endure",
      type: "normal",
      power: null,
      accuracy: null,
      pp: 10,
      priority: 4,
      damage_class: "status",
      effect_chance: null,
      ailment: { name: "none", chance: 0 },
      category: "unique",
    },
    {
      name: "metal-claw",
      type: "steel",
      power: 50,
      accuracy: 95,
      pp: 35,
      priority: 0,
      damage_class: "physical",
      effect_chance: 10,
      ailment: { name: "none", chance: 0 },
      category: "damage+raise",
    },
    {
      name: "rest",
      type: "psychic",
      power: null,
      accuracy: null,
      pp: 5,
      priority: 0,
      damage_class: "status",
      effect_chance: null,
      ailment: { name: "none", chance: 0 },
      category: "unique",
    },
  ],
};

console.log(
  await calculateDamage(
    pokemon,
    pokemon.moves.at(Math.floor(Math.random() * 4)),
    {
      type1: "water",
      defense: 10,
      specialDefense: 105,
    }
  )
);
