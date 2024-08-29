import Pokedex from "pokedex-promise-v2";

const P = new Pokedex();

const moves = await P.getMovesList();
console.log(moves);
