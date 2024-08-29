import Pokedex from "pokedex-promise-v2";

const P = new Pokedex();

const mapStats = (pokemon) => {
  const stats = {};
  pokemon.stats.forEach((stat) => {
    const formattedName = stat.stat.name.replace(/-(.)/g, (match, p1) =>
      p1.toUpperCase()
    );
    stats[formattedName] = stat.base_stat;
  });

  return stats;
};

const mapMoves = (moves) => moves.map((move) => mapMove(move));

const mapMove = (move) => {
  const mappedMove = {};

  mappedMove.name = move.name
    .replace(/-(.)/g, (match, p1) => " " + p1.toUpperCase())
    .replace(/^./, (str) => str.toUpperCase());

  mappedMove.type = move.type.name;
  mappedMove.accuracy = move.accuracy;
  mappedMove.power = move.power;
  mappedMove.priority = move.priority;

  return mappedMove;
};

const fetchMoves = async (moveNames) => {
  const movePromises = moveNames.map(async (moveName) => {
    const normalizedName = moveName.toLowerCase().replace(/\s/g, "-");
    const move = await P.getMoveByName(normalizedName);
    return move;
  });

  const moves = await Promise.all(movePromises);
  return mapMoves(moves);
};

const fetchPokemonData = async (name, moveNames) => {
  try {
    const pokemon = await P.getPokemonByName(name.toLowerCase());
    const stats = mapStats(pokemon);
    const moves = await fetchMoves(moveNames);
    const createdPokemon = { name, stats, moves };
    console.log(createdPokemon);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

fetchPokemonData("Golduck", [
  "Surf",
  "Hidden Power",
  "Psyshock",
  "Hypnosis",
  "Quick Attack",
]);
