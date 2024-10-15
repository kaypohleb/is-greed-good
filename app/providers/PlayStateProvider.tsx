"use client";

import { PlayState } from "@/types";
import {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { initializePlayState } from "@/utils/playState";

interface PlayStateContextProps {
  playState: PlayState;
  forceUpdate: (newPlayState: PlayState) => void;
  forcedGet: () => void;
  updatePlayState: (newPlayState: PlayState) => void;
}

export const PlayStateContext = createContext<
  PlayStateContextProps | undefined
>(undefined);

export function usePlayStateContext() {
  const context = useContext(PlayStateContext);
  if (context === undefined) {
    throw new Error(
      "usePlayStateContext must be used within a PlayStateProvider"
    );
  }
  return context;
}

interface PlayStateProviderProps {
  difficulty: string;
  children: React.ReactNode;
}

const comparePlayStates = (a: PlayState | null, b: PlayState | null) => {
  //ignore the updated field
  if (!a || !b) return false;
  const { updated: aUpdated, ...aRest } = a;
  const { updated: bUpdated, ...bRest } = b;
  return JSON.stringify(aRest) === JSON.stringify(bRest);
};

const playStateFetcher = async (userId: string) => {
  if (userId === "randomUser") return null;
  const res = await fetch(`/api/playState/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch playState");
  return res.json();
};

const PlayStateProvider = (props: PlayStateProviderProps) => {
  //create a provider for data retrieval react
  if (!PlayStateContext) {
    throw new Error("PlayStateContext is unavailable in Server Components");
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
    data: serverPlayState,
    isLoading,
    error,
  } = useSWR(userId, playStateFetcher);

  const [playState, setPlayState] = useState<PlayState | null>(null);

  useEffect(() => {
    async function reintializeServer(user: string, playState: PlayState) {
      if (user === "randomUser") return;
      try {
        await fetch(`/api/playState/${user}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(playState),
        });
      } catch (error) {
        console.error("Error updating PlayState", error);
      }
    }

    if (!serverPlayState && !error) {
      const storedPlayState: PlayState | null = JSON.parse(
        sessionStorage.getItem(`playState:${userId}`) || "null"
      );
      if (storedPlayState) {
        let updatedPlayState = storedPlayState;
        if (storedPlayState.date !== getDateString()) {
          updatedPlayState = initializePlayState(userId, difficulty);
        }
        setPlayState(updatedPlayState);
      } else {
        setPlayState(initializePlayState(userId, difficulty));
      }
    } else if (serverPlayState) {
      let updatedPlayState = serverPlayState;
      if (serverPlayState.date !== getDateString()) {
        console.log("Reinitializing playState");
        updatedPlayState = initializePlayState(userId, difficulty);
        reintializeServer(userId, updatedPlayState);
      }
      setPlayState(updatedPlayState);
      sessionStorage.setItem(
        `playState:${userId}`,
        JSON.stringify(updatedPlayState)
      ); // Cache user data in sessionStorage
    }
  }, [serverPlayState, error, userId, getDateString, difficulty]);

  useEffect(() => {
    //sync current state in sessionStorage if userId is random
    const sessionPlayState: PlayState = JSON.parse(
      sessionStorage.getItem(`playState:${userId}`) || "null"
    );
    if (
      userId === "randomUser" &&
      playState &&
      !comparePlayStates(sessionPlayState, playState)
    ) {
      sessionStorage.setItem(`playState:${userId}`, JSON.stringify(playState));
    }
  });

  useEffect(() => {
    async function initializeData(user: string) {
      await fetch(`/api/playState/${user}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initializePlayState(user, difficulty)),
      });
    }

    if (error && userId !== "randomUser") {
      initializeData(userId);
    }
  }, [difficulty, error, userId]);

  const forcedGet = async () => {
    if (userId === "randomUser")
      throw new Error("Cannot force get for random user");
    try {
      await fetch(`/api/playState/${userId}`, {
        cache: "no-cache",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        const data: PlayState = await response.json();
        setPlayState(data);
      });
    } catch (error) {
      console.error("Error fetching PlayState", error);
    }
  };

  const forceUpdate = async (newPlayState: PlayState) => {
    updatePlayState(newPlayState);
    if (userId === "randomUser") return;
    try {
      await fetch(`/api/playState/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playState),
      });
    } catch (error) {
      console.error("Error updating PlayState", error);
    }
  };

  const updatePlayState = (state: PlayState) => {
    setPlayState({ ...state, updated: new Date().toISOString() });
  };

  if (isLoading || !playState) return <div>Loading...</div>;

  return (
    <PlayStateContext.Provider
      value={{
        playState,
        forceUpdate,
        forcedGet,
        updatePlayState,
      }}
    >
      {props.children}
    </PlayStateContext.Provider>
  );
};

export default PlayStateProvider;
