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
      const result = battle(this.pokemonList, opponentTeam.pokemonList);
      switch (result) {
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
    console.log(score);
    return score.win * 3 + score.draw;
  }

  crossover(otherTeam) {
    const newTeamList = this.pokemonList
      .slice(0, 3) // First half from this team
      .concat(otherTeam.pokemonList.slice(3)); // Second half from the other team
    return new PokemonTeam(newTeamList);
  }

  mutate(pokemonPool) {
    const idx = Math.floor(Math.random() * this.pokemonList.length);
    this.pokemonList[idx] =
      pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
  }
}

const calculateTypeEffectiveness = (mt, t1, t2) => {
  if (!mt) return 1.0;

  let multiplier = 1.0;
  const typeData = TYPE_CHART[mt];

  if (typeData.strongVs.includes(t1)) {
    multiplier *= 2;
  } else if (typeData.weakVs.includes(t1)) {
    multiplier *= 0.5;
  } else if (typeData.noDamageVs.includes(t1)) {
    multiplier *= 0;
  }

  if (t2) {
    if (typeData.strongVs.includes(t2)) {
      multiplier *= 2;
    } else if (typeData.weakVs.includes(t2)) {
      multiplier *= 0.5;
    } else if (typeData.noDamageVs.includes(t2)) {
      multiplier *= 0;
    }
  }

  return multiplier;
};

const calculateDamage = (attacker, move, defender) => {
  if (move.power == null) return 0;

  const isCritical = Math.floor(Math.random() * 10000) < 664; // Gen 2 critical hit chance
  const criticalMultiplier =
    isCritical && !["Flail", "Reversal", "Future Sight"].includes(move.name)
      ? 2
      : 1;

  // Function to determine the number of hits for Triple Kick
  const getTripleKickCount = () => {
    if (Math.random() <= 0.333) {
      return Math.random() <= 0.333 ? 3 : 2;
    }
    return 1;
  };

  const level = attacker.level;
  const power = move.power;
  const attack = isPhysical(move.type)
    ? attacker.stats["attack"]
    : attacker.stats["special-attack"];
  const defense = isPhysical(move.type)
    ? defender.stats["defense"]
    : defender.stats["special-defense"];
  const itemMultiplier = isTypeItem(
    attacker.types[0],
    attacker.types[1],
    attacker.item
  )
    ? 1.1
    : 1;
  const tripleKickHits = move.name === "Triple Kick" ? getTripleKickCount() : 1;
  const weatherMultiplier = 1; // Simplified
  const badgeMultiplier = 1; // Simplified
  const stabMultiplier = attacker.types.includes(move.type) ? 1.5 : 1;
  const typeEffectiveness = ["Struggle", "Future Sight", "Beat Up"].includes(
    move.name
  )
    ? 1
    : calculateTypeEffectiveness(
        move.type,
        defender.types[0],
        defender.types[1]
      );
  const moveMultiplier = 1; // Simplified
  const randomMultiplier = (
    (Math.floor(Math.random() * (255 - 217 + 1)) + 217) /
    255
  ).toFixed(2);
  const doubleDamageMultiplier = 1; // Simplified

  return Math.floor(
    (((((2 * level) / 5 + 2) * power * attack) / defense / 50) *
      itemMultiplier *
      criticalMultiplier +
      2) *
      tripleKickHits *
      weatherMultiplier *
      badgeMultiplier *
      stabMultiplier *
      typeEffectiveness *
      moveMultiplier *
      randomMultiplier *
      doubleDamageMultiplier
  );
};

const deepCopyPokemon = (pokemon) => ({
  ...pokemon,
  stats: { ...pokemon.stats },
  moves: pokemon.moves.map((move) => ({ ...move })),
});

const battle = (team1, team2) => {
  // Create deep copies of teams to ensure the original teams remain unmodified
  let team1Pokemon = team1.map(deepCopyPokemon);
  let team2Pokemon = team2.map(deepCopyPokemon);

  const handleStatusEffects = (pokemon) => {
    const statusChanceMap = {
      [STATUS.FREEZE]: 0.1,
      [STATUS.PARALYSIS]: 0.25,
      [STATUS.SLEEP]: 0.33,
    };

    // Handle status recovery
    if (
      statusChanceMap[pokemon.status] &&
      Math.random() < statusChanceMap[pokemon.status]
    ) {
      pokemon.status = STATUS.NONE;
    }

    // Handle status damage
    if ([STATUS.BURN, STATUS.POISON].includes(pokemon.status)) {
      pokemon.stats.hp -= Math.floor(pokemon.stats.hp / 8);
      pokemon.stats.hp = Math.max(pokemon.stats.hp, 0); // Ensure HP doesn't go below 0
    }
  };

  const performAttack = (attacker, move, defender) => {
    if ([STATUS.NONE, STATUS.BURN, STATUS.POISON].includes(attacker.status)) {
      if (
        Object.values(STATUS).includes(move.ailment.name) &&
        defender.status === STATUS.NONE &&
        (Math.random() < move.ailment.chance / 100 || move.ailment.chance === 0)
      ) {
        defender.status = move.ailment.name;
      }
      const damage = calculateDamage(attacker, move, defender);
      defender.stats.hp -= Math.max(damage, 0);
    }
  };

  const determineAttackOrder = (pokemon1, pokemon2, move1, move2) => {
    if (move1.priority > move2.priority) {
      return pokemon1;
    } else if (move2.priority > move1.priority) {
      return pokemon2;
    } else {
      // If priorities are tied, use speed
      return pokemon1.stats.speed > pokemon2.stats.speed ? pokemon1 : pokemon2;
    }
  };

  let turn = 0;
  while (team1Pokemon.length > 0 && team2Pokemon.length > 0) {
    if (turn++ > 20000) {
      // fs.writeFileSync("./log/too_many_moves.json", JSON.stringify([team1Pokemon, team2Pokemon])); // Write only the Pokémon lists
      break;
    }

    const team1Active = team1Pokemon[0];
    const team2Active = team2Pokemon[0];

    // Select random moves for both active Pokémon
    const team1Move =
      team1Active.moves[Math.floor(Math.random() * team1Active.moves.length)];
    const team2Move =
      team2Active.moves[Math.floor(Math.random() * team2Active.moves.length)];

    // Determine which Pokémon attacks first
    const firstAttacker = determineAttackOrder(
      team1Active,
      team2Active,
      team1Move,
      team2Move
    );
    const secondAttacker =
      firstAttacker === team1Active ? team2Active : team1Active;
    const firstMove = firstAttacker === team1Active ? team1Move : team2Move;
    const secondMove = firstAttacker === team1Active ? team2Move : team1Move;

    // Perform first attack
    handleStatusEffects(firstAttacker);
    if (firstAttacker.stats.hp > 0) {
      performAttack(firstAttacker, firstMove, secondAttacker);
    }

    // Check if the second attacker has fainted
    if (secondAttacker.stats.hp <= 0) {
      if (secondAttacker === team2Active) {
        team2Pokemon.shift();
        if (team2Pokemon.length > 0) {
          team2Pokemon = pickNewActive(team2Pokemon, team1Active);
        } else {
          break;
        }
      } else {
        team1Pokemon.shift();
        if (team1Pokemon.length > 0) {
          team1Pokemon = pickNewActive(team1Pokemon, team2Active);
        } else {
          break;
        }
      }
      // Skip the second attack if the second attacker has fainted
      continue;
    }

    // Perform second attack
    handleStatusEffects(secondAttacker);
    if (secondAttacker.stats.hp > 0) {
      performAttack(secondAttacker, secondMove, firstAttacker);
    }

    // Check if the first attacker has fainted
    if (firstAttacker.stats.hp <= 0) {
      if (firstAttacker === team2Active) {
        team2Pokemon.shift();
        if (team2Pokemon.length > 0) {
          team2Pokemon = pickNewActive(team2Pokemon, team1Active);
        } else {
          break;
        }
      } else {
        team1Pokemon.shift();
        if (team1Pokemon.length > 0) {
          team1Pokemon = pickNewActive(team1Pokemon, team2Active);
        } else {
          break;
        }
      }
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
  );
};

const mapTypes = (pokemon) => {
  return [
    pokemon.types[0].type.name,
    ...(pokemon.types[1] ? [pokemon.types[1].type.name] : []),
  ];
};

const mapStats = (pokemon) => {
  return pokemon.stats.reduce((acc, stat) => {
    // Calculate stats at level 50
    // Use max IVs for simplicity
    const statAtLvl50 = Math.floor(((2 * stat.base_stat + 31) * 50) / 100);
    acc[stat.stat.name] =
      stat.stat.name == "hp" ? statAtLvl50 + 50 + 10 : statAtLvl50 + 5;
    return acc;
  }, {});
};

const mapMoves = (pokemon) => {
  const allMoves = JSON.parse(
    fs.readFileSync("./common/moves_from_gen_ii_trimmed.json", {
      encoding: "utf8",
    })
  );
  const filteredMoves = allMoves
    .filter((move) => pokemon.moves.map((m) => m.move.name).includes(move.name))
    .map((m) => ({
      name: m.name,
      type: m.type.name,
      power: m.power,
      accuracy: m.accuracy,
      priority: m.priority,
      damage_class: m.damage_class.name,
      effect_chance: m.effect_chance,
      ailment: { name: m.meta.ailment.name, chance: m.meta.ailment_chance },
      category: m.meta.category.name,
    }))
    .sort(() => 0.5 - Math.random());
  return filteredMoves.slice(
    0,
    filteredMoves.length > 4 ? 4 : filteredMoves.length
  );
};

function mapPokemon(pokemon) {
  return {
    name: pokemon.name,
    level: 50,
    types: mapTypes(pokemon),
    stats: mapStats(pokemon),
    moves: mapMoves(pokemon),
    status: STATUS.NONE,
  };
}

function fetchPokemonData() {
  const allPokemon = JSON.parse(
    fs.readFileSync("./common/pokemon_from_gens_i_and_ii_trimmed.json", {
      encoding: "utf-8",
    })
  );
  return allPokemon.map(mapPokemon);
}

function generateRandomTeam(pokemonPool) {
  const shuffledPool = pokemonPool.sort(() => 0.5 - Math.random());
  return new PokemonTeam(shuffledPool.slice(0, 6));
}

const gwoOptimization = (pokemonPool, numTeams, maxIterations) => {
  let a = 2; // GWO parameter
  let alphaTeam, betaTeam, deltaTeam;

  // Initialize a population of teams
  const teams = Array.from({ length: numTeams }, () =>
    generateRandomTeam(pokemonPool)
  );

  // fs.writeFileSync(
  //   "./log/teams.json",
  //   JSON.stringify(teams.map((team) => team.pokemonList))
  // );

  let fitnessScores = new Array(numTeams).fill(0);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Calculate fitness for all teams
    for (let i = 0; i < numTeams; i++) {
      const opponentTeams = teams.slice(0, i).concat(teams.slice(i + 1));
      fitnessScores[i] = teams[i].fitness(opponentTeams);
    }

    // Identify alpha, beta, and delta teams based on fitness scores
    const alphaIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    alphaTeam = teams[alphaIndex];

    const sortedIndices = fitnessScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .map(({ index }) => index);

    betaTeam = teams[sortedIndices[1]];
    deltaTeam = teams[sortedIndices[2]];

    // Update teams using crossover and mutation
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

    console.log(
      `Iteration ${
        iteration + 1
      }: Fitness scores: ${fitnessScores}, Alpha team: ${JSON.stringify(
        alphaTeam.pokemonList,
        null,
        2
      )}`
    );
  }

  // Return the best team (alpha team)
  return alphaTeam;
};

// Define your Pokémon pool and run the optimization
const pokemonPool = fetchPokemonData();

const numTeams = 100; // Number of teams
const maxIterations = 50; // Number of iterations

const bestTeam = gwoOptimization(pokemonPool, numTeams, maxIterations);

console.log("Best team:", JSON.stringify(bestTeam.pokemonList, null, 2));
