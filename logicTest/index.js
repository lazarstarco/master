class PokemonTeam {
  constructor(pokemonList) {
    this.pokemonList = pokemonList;
  }

  fitness() {}

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
  let fitnessScores = new Array(numTeams).fill(0);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Calculate fitness for all teams
    for (let i = 0; i < numTeams; i++) {
      fitnessScores[i] = teams[i].fitness();
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

// Example usage:

// Define your Pokémon pool (use actual Pokémon data in practice)
const pokemonPool = Array.from({ length: 200 }, (_, i) => `Pokemon_${i + 1}`);

const numTeams = 100; // Number of teams
const maxIterations = 50; // Number of iterations

const bestTeam = gwoOptimization(pokemonPool, numTeams, maxIterations);

console.log("Best team:", bestTeam.pokemonList);
