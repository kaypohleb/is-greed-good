export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type BetResult = {
  bet: number;
  result: number;
};

export type MiniState = {
  id: string;
  game: string;
  difficulty: string;
  date: string;
  updated: string;
  state: number;
  currentMult: number;
  format: string;
};

export type PlayState = {
  id: string;
  difficulty: string;
  userPhase: number; //0:user betting 1: user ended
  date: string;
  updated: string;
  userAmt: number;
  totalRolls: number;
  betAmts: number[];
  betResults: BetResult[][];
  loyaltyStreaks: number[];
  machineSettings: number[][];
  machineSelected: number;
  machineSeeds: string[];
  machineRolls: number[];
  luckiestStreak: string[];
  curMiniGame: MiniState;
};

export type DayPlayState = {
  userId: string;
  date: string;
  playState: PlayState;
};

//session:by-user-id:[id]:[date]
type DaySession = {
  active: boolean; //if false, user has finished session
  date: string; //ISO date
  amt: number;
  seeds: string[];
  biggestLosses: number;
  biggestWins: number;
  longestgreedStreak: number;
  debug: boolean;
};

//session:by-user-id:[id]
type UserSessions = {
  dates: string[];
};

// add to sorted set when user finishes a session
// await kv.zadd(
//     'scores',
//     { score: 1, member: 'team1' },
//     { score: 2, member: 'team2' },
//   );
//   data = await kv.zrange('scores', 0, 0);
//   console.log(data); // [ 'team1' ]

//use ZScore to get sorted set for
//score:by-day:[date]
type DayScores = {
  userId: string;
  score: number;
};

export type EventBusEvent = {
  type: string;
  data: string;
};
