"use client";

import { MiniState } from "@/types";
import {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { initializeMiniState } from "@/utils/miniState";

interface MiniStateContextProps {
  miniState: MiniState;
  forceUpdate: (newMiniState: MiniState) => void;
  forcedGet: () => void;
  updateMiniState: (newMiniState: MiniState) => void;
}

export const MiniStateContext = createContext<
  MiniStateContextProps | undefined
>(undefined);

export function useMiniStateContext() {
  const context = useContext(MiniStateContext);
  if (context === undefined) {
    throw new Error(
      "useMiniStateContext must be used within a MiniStateProvider"
    );
  }
  return context;
}

interface MiniStateProviderProps {
  game: string;
  difficulty: string;
  children: React.ReactNode;
}

const compareMiniStates = (a: MiniState | null, b: MiniState | null) => {
  //ignore the updated field
  if (!a || !b) return false;
  const { updated: aUpdated, ...aRest } = a;
  const { updated: bUpdated, ...bRest } = b;
  return JSON.stringify(aRest) === JSON.stringify(bRest);
};

const miniStateFetcher = async (userId: string, game: string) => {
  if (userId === "randomUser" || game === "") return null;
  const res = await fetch(`/api/miniState/${userId}/${game}`);
  if (!res.ok) throw new Error("Failed to fetch playState");
  return res.json();
};

const MiniStateProvider = (props: MiniStateProviderProps) => {
  //create a provider for data retrieval react
  if (!MiniStateContext) {
    throw new Error("MiniStateContext is unavailable in Server Components");
  }

  const { data: session } = useSession();

  let userId = "randomUser";
  let difficulty = props.difficulty;

  if (session && session.user && session.user.id) {
    userId = session.user.id;
  }

  const getDateString = useCallback(() => {
    const dt = new Date();
    return (
      dt.getDate().toString() +
      dt.getMonth().toString() +
      dt.getFullYear().toString()
    );
  }, []);

  const {
    data: serverMiniState,
    isLoading,
    error,
  } = useSWR([userId, props.game], ([id, game]) => miniStateFetcher(id, game));

  const [miniState, setMiniState] = useState<MiniState | null>(null);

  useEffect(() => {
    async function reintializeServer(
      user: string,
      game: string,
      miniState: MiniState
    ) {
      if (user === "randomUser") return;
      try {
        await fetch(`/api/miniState/${user}/${game}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(miniState),
        });
      } catch (error) {
        console.error("Error updating MiniState", error);
      }
    }

    if (!serverMiniState && !error) {
      const storedMiniState: MiniState | null = JSON.parse(
        sessionStorage.getItem(`miniState:${userId}:${props.game}`) || "null"
      );
      if (storedMiniState) {
        let updatedMiniState = storedMiniState;
        if (storedMiniState.date !== getDateString()) {
          updatedMiniState = initializeMiniState(
            userId,
            difficulty,
            props.game
          );
        }
        setMiniState(updatedMiniState);
      } else {
        setMiniState(initializeMiniState(userId, difficulty, props.game));
      }
    } else if (serverMiniState) {
      let updatedMiniState = serverMiniState;
      if (serverMiniState.date !== getDateString()) {
        console.log("Reinitializing miniState");
        updatedMiniState = initializeMiniState(userId, difficulty, props.game);
        reintializeServer(userId, props.game, updatedMiniState);
      }
      setMiniState(updatedMiniState);
      sessionStorage.setItem(
        `miniState:${userId}:${props.game}`,
        JSON.stringify(updatedMiniState)
      ); // Cache user data in sessionStorage
    }
  }, [serverMiniState, error, userId, getDateString, difficulty, props.game]);

  useEffect(() => {
    //sync current state in sessionStorage if userId is random
    const sessionMiniState: MiniState = JSON.parse(
      sessionStorage.getItem(`miniState:${userId}:${props.game}`) || "null"
    );
    if (
      userId === "randomUser" &&
      miniState &&
      !compareMiniStates(sessionMiniState, miniState)
    ) {
      sessionStorage.setItem(
        `miniState:${userId}:${props.game}`,
        JSON.stringify(miniState)
      );
    }
  });

  useEffect(() => {
    async function initializeData(user: string, game: string) {
      await fetch(`/api/miniState/${user}/${game}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initializeMiniState(user, difficulty, props.game)),
      });
    }

    if (error && userId !== "randomUser") {
      initializeData(userId, props.game);
    }
  }, [difficulty, error, props.game, userId]);

  const forcedGet = async () => {
    if (userId === "randomUser")
      throw new Error("Cannot force get for random user");
    try {
      await fetch(`/api/miniState/${userId}`, {
        cache: "no-cache",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        const data: MiniState = await response.json();
        setMiniState(data);
      });
    } catch (error) {
      console.error("Error fetching MiniState", error);
    }
  };

  const forceUpdate = async (newMiniState: MiniState) => {
    updateMiniState(newMiniState);
    if (userId === "randomUser") return;
    try {
      await fetch(`/api/miniState/${userId}/${props.game}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(miniState),
      });
    } catch (error) {
      console.error("Error updating MiniState", error);
    }
  };

  const updateMiniState = (newMiniState: MiniState) => {
    setMiniState({ ...newMiniState, updated: new Date().toISOString() });
  };

  if (isLoading || !miniState) return <div>Loading...</div>;

  return (
    <MiniStateContext.Provider
      value={{
        miniState,
        forceUpdate,
        forcedGet,
        updateMiniState,
      }}
    >
      {props.children}
    </MiniStateContext.Provider>
  );
};

export default MiniStateProvider;
