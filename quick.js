import fs from "fs";
import Pokedex from "pokedex-promise-v2";

const P = new Pokedex();

// try {
//   // const response = await P.getMoveByName("leech-seed");
//   const response = await P.getMoveByName("triple-kick");
//   const out = {
//     power: response.power,
//     accuracy: response.accuracy,
//     priority: response.priority,
//     type: response.type.name,
//     category: response.meta.category.name,
//   };
//   response.flavor_text_entries = null;
//   response.learned_by_pokemon = null;
//   fs.writeFile("./log/movetest.txt", JSON.stringify(response), (err) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log("File written successfully!");
//     }
//   });
//   console.log(out);
//   console.log(response.meta);
// } catch (e) {
//   console.log("Error: ", JSON.stringify(e));
// }

// // MOVES CACHE
// try {
//   const allMoves = await P.getMovesList();
//   const allMoveNames = allMoves.results.map((move) => move.name);

//   const movesFromGenII = [];
//   for (const moveName of allMoveNames) {
//     const move = await P.getMoveByName(moveName);
//     console.log(move.generation.name);

//     if (
//       move.generation.name != "generation-i" &&
//       move.generation.name != "generation-ii"
//     ) {
//       break;
//     }
//     movesFromGenII.push(move);
//   }

//   fs.writeFileSync(
//     "./log/moves_from_gen_2.json",
//     JSON.stringify(movesFromGenII),
//     (err) => {
//       console.log(err);
//     }
//   );
// } catch (e) {
//   console.log("Error: ", JSON.stringify(e));
// }

// // POKEMON CACHE
// try {
//   const count = 251;

//   const pokemonFromGensIandII = [];
//   for (let i = 1; i <= count; i++) {
//     const pokemon = await P.getPokemonByName(i);
//     console.log(pokemon.name);
//     pokemonFromGensIandII.push(pokemon);
//   }

//   fs.writeFileSync(
//     "./log/pokemon_from_gens_i_and_ii.json",
//     JSON.stringify(pokemonFromGensIandII),
//     (err) => {
//       console.log(err);
//     }
//   );
// } catch (e) {
//   console.log("Error: ", JSON.stringify(e));
// }

import { isTypeItem, TYPE_ITEMS } from "./common/lists.js";

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

const cachePokemon = (pokemon) => {
  fs.writeFileSync("./log/pokemontemp.json", JSON.stringify(pokemon));
};

const allPokemon = JSON.parse(
  fs.readFileSync("./log/pokemon_from_gens_i_and_ii_trimmed.json", {
    encoding: "utf-8",
  })
);

const shouldCache = true;
const pokemon = allPokemon[3];
const mappedPokemon = {};

mappedPokemon.name = pokemon.name;
mappedPokemon.level = 50;
mappedPokemon.types = mapTypes(pokemon);
mappedPokemon.stats = mapStats(pokemon);
mappedPokemon.moves = mapMoves(pokemon);
console.log(
  isTypeItem(
    mappedPokemon.types[0],
    mappedPokemon.types[1],
    TYPE_ITEMS.CHARCOAL
  )
);
if (shouldCache) cachePokemon(mappedPokemon);
