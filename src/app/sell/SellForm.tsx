"use client";


import GamesTable from "@/core/components/GamesTable";
import SearchForm from "./SearchForm";
import { useState } from "react";
import { ParsedThing } from "@/core/models/models";


type StateI = {
  games: ParsedThing[] | [];
};

const initialState: StateI = {
  games: [],
};

export default function SellForm() {
  const [state, setState] = useState<StateI>(initialState);
  const { games } = state;
  const setGames =  (games:any) => {
    setState((prevState) => ({ ...prevState, games }));
  }
  return (
    <>
      <SearchForm setGames={setGames}/>
      {games.length !== 0 && <GamesTable games={games} />}
    </>
  );
}
