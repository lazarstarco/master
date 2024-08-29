import fs from "fs";
import {
  BATTLE_STATUS,
  STATUS,
  TYPE_CHART,
  isPhysical,
  isTypeItem,
} from "./common/constants.js";

class PokemonTeam {
  constructor(pokemonList) {
    this.pokemonList = pokemonList;
  }

  fitness(opponentTeams) {
    const score = { win: 0, draw: 0, loss: 0 };
    for (const opponentTeam of opponentTeams) {
      switch (battle(this.pokemonList, opponentTeam.pokemonList)) {
        case BATTLE_STATUS.WIN:
          score.win++;
          break;
        case BATTLE_STATUS.DRAW:
          score.draw++;
          break;
        case BATTLE_STATUS.LOSS:
          score.loss++;
          break;
      }
    }

    return score.win * 3 + score.draw;
  }

  crossover(otherTeam) {
    // Combine parts of two teams to form a new team
    const newTeam = this.pokemonList
      .slice(0, 3)
      .concat(otherTeam.pokemonList.slice(3));
    return new PokemonTeam(newTeam);
  }

  mutate(pokemonPool) {
    // Mutate the team by replacing a random Pokémon
    const idx = Math.floor(Math.random() * 6);
    this.pokemonList[idx] =
      pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
  }
}

const calculateTypeEffectiveness = (mt, t1, t2) => {
  if (!mt) {
    return 1.0;
  }

  let m = 1.0;

  let t = TYPE_CHART[mt];

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

const calculateDamage = (attacker, move, defender) => {
  if (move.power == null) {
    return 0;
  }
  const isCrit = Math.floor(Math.random() * 10000) < 664; // 664 is a random factor in gen 2

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

  const level = attacker.level;
  const power = move.power;
  const attack = isPhysical(move.type)
    ? attacker.stats["attack"]
    : attacker.stats["special-attack"];
  const defense = isPhysical(move.type)
    ? defender.stats["defense"]
    : defender.stats["special-defense"];
  const item = isTypeItem(attacker.types[0], attacker.types[1], attacker.item)
    ? 1.1
    : 1;
  const critical =
    !isCrit || ["Flail", "Reversal", "Future Sight"].includes(move.name)
      ? 1
      : 2;
  const tk = (move.name = "Triple Kick" ? getTripleKickCount() : 1);
  const weather = 1; // simplified
  const badge = 1; // simplified
  const STAB = attacker.types.includes(move.type) ? 1.5 : 1;
  const typeEffectiveness = ["Struggle", "Future Sight", "Beat Up"].includes(
    move.name
  )
    ? 1
    : calculateTypeEffectiveness(
        move.type,
        defender.types[0],
        defender.types[1]
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

const battle = (team1, team2) => {
  const team1Pokemon = team1.map((pokemon) => ({ ...pokemon }));
  const team2Pokemon = team2.map((pokemon) => ({ ...pokemon }));

  while (team1Pokemon.length > 0 && team2Pokemon.length > 0) {
    const team1Active = team1Pokemon[0];
    const team2Active = team2Pokemon[0];

    // Team 1 attacks
    const team1Move = team1Active.moves[Math.floor(Math.random() * 4)];
    const team1Damage = calculateDamage(team1Active, team1Move, team2Active);
    team2Active.stats.hp -= team1Damage;

    if (team2Active.stats.hp <= 0) {
      team2 = team2Pokemon.slice(1);
      if (team2.length === 0) {
        return BATTLE_STATUS.WIN;
      }
      team2 = pickNewActive(team2Pokemon, team1Active);
    }

    // Team 2 attacks
    const team2Move = team2Active.moves[Math.floor(Math.random() * 4)];
    const team2Damage = calculateDamage(team2Active, team2Move, team1Active);
    team1Active.stats.hp -= team2Damage;

    if (team1Active.stats.hp <= 0) {
      team1 = team1Pokemon.slice(1);
      if (team1.length === 0) {
        return BATTLE_STATUS.LOSS;
      }
      team1 = pickNewActive(team2Pokemon, team1Active);
    }
  }

  if (team1Pokemon.length === 0 && team2Pokemon.length === 0) {
    return BATTLE_STATUS.DRAW;
  } else if (team1Pokemon.length === 0) {
    return BATTLE_STATUS.LOSS;
  } else {
    return BATTLE_STATUS.WIN;
  }
};

const pickNewActive = (team, active) => {
  return team.sort(
    (a, b) =>
      calculateTypeEffectiveness(a.types[0], active.types[0], active.types[1]) +
        calculateTypeEffectiveness(
          a.types[1],
          active.types[0],
          active.types[1]
        ) >
      calculateTypeEffectiveness(b.types[0], active.types[0], active.types[1]) +
        calculateTypeEffectiveness(b.types[1], active.types[0], active.types[1])
  )[0];
};

const mapTypes = (pokemon) => {
  return [
    pokemon.types[0].type.name,
    ...(pokemon.types[1] ? [pokemon.types[1].type.name] : []),
  ];
};

const mapStats = (pokemon) => {
  return pokemon.stats.reduce((acc, stat) => {
    // 31 - max iv
    // 50 - lvl
    const statAtLvl50 = Math.floor(((2 * stat.base_stat + 31) * 50) / 100);
    acc[stat.stat.name] =
      stat.stat.name == "hp" ? statAtLvl50 + 50 + 10 : statAtLvl50 + 5;
    return acc;
  }, {});
};

const mapMoves = (pokemon) => {
  const allMoves = JSON.parse(
    fs.readFileSync("./log/moves_from_gen_ii_trimmed.json", {
      encoding: "utf8",
    })
  );
  return allMoves
    .filter((move) => pokemon.moves.map((m) => m.move.name).includes(move.name))
    .map((m) => {
      return {
        name: m.name,
        type: m.type.name,
        power: m.power,
        accuracy: m.accuracy,
        priority: m.priority,
        damage_class: m.damage_class.name,
        effect_chance: m.effect_chance,
        ailment: { name: m.meta.ailment.name, chance: m.meta.ailment_chance },
        category: m.meta.category.name,
      };
    })
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);
};

function mapPokemon(pokemon) {
  const mappedPokemon = {};

  mappedPokemon.name = pokemon.name;
  mappedPokemon.level = 50;
  mappedPokemon.types = mapTypes(pokemon);
  mappedPokemon.stats = mapStats(pokemon);
  mappedPokemon.moves = mapMoves(pokemon);
  mappedPokemon.status = STATUS.NONE;

  return mappedPokemon;
}

function fetchPokemonData() {
  // Fetch Pokémon data from an external source
  const allPokemon = JSON.parse(
    fs.readFileSync("./log/pokemon_from_gens_i_and_ii_trimmed.json", {
      encoding: "utf-8",
    })
  );

  return allPokemon.map((pokemon) => mapPokemon(pokemon));
}

function generateRandomTeam(pokemonPool) {
  // Generate a random Pokémon team of 6 unique Pokémon
  const shuffledPool = pokemonPool.sort(() => 0.5 - Math.random());
  return new PokemonTeam(shuffledPool.slice(0, 6));
}

function gwoOptimization(pokemonPool, numTeams, maxIterations) {
  let a = 2; // GWO parameter
  let alphaTeam, betaTeam, deltaTeam;

  // Initialize a population of teams
  const teams = Array.from({ length: numTeams }, () =>
    generateRandomTeam(pokemonPool)
  );
  // fs.writeFileSync("./log/teams.json", JSON.stringify(teams));
  let fitnessScores = new Array(numTeams).fill(0);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Calculate fitness for all teams
    for (let i = 0; i < numTeams; i++) {
      const opponentTeams = teams.slice(0, i).concat(teams.slice(i + 1));
      fitnessScores[i] = teams[i].fitness(opponentTeams);
    }

    // Identify alpha, beta, delta teams
    const alphaIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    alphaTeam = teams[alphaIndex];

    const sortedIndices = fitnessScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .map(({ index }) => index);

    betaTeam = teams[sortedIndices[1]];
    deltaTeam = teams[sortedIndices[2]];

    // Update the teams
    for (let i = 0; i < numTeams; i++) {
      if ([alphaIndex, sortedIndices[1], sortedIndices[2]].includes(i))
        continue;

      const r1 = Math.random();
      const A1 = 2 * a * r1 - a;

      let newTeam;
      if (A1 < 0) {
        newTeam = teams[i].crossover(alphaTeam);
      } else if (A1 < 1) {
        newTeam = teams[i].crossover(betaTeam);
      } else {
        newTeam = teams[i].crossover(deltaTeam);
      }

      // Introduce random mutation to maintain diversity
      if (Math.random() < 0.1) {
        newTeam.mutate(pokemonPool);
      }

      teams[i] = newTeam;
    }

    // Decrease the parameter 'a'
    a = 2 - iteration * (2 / maxIterations);
  }

  // Return the best team (alpha team)
  return alphaTeam;
}
// Define your Pokémon pool
// const pokemonPool = Array.from({ length: 200 }, (_, i) => `Pokemon_${i + 1}`);
const pokemonPool = fetchPokemonData();

const numTeams = 100; // Number of teams
const maxIterations = 50; // Number of iterations

const bestTeam = gwoOptimization(pokemonPool, numTeams, maxIterations);

console.log("Best team:", bestTeam.pokemonList);
