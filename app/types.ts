type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

//session:by-user-id:[id]:[date]
type DaySession = {
    active: boolean; //if false, user has finished session
  date: string; //ISO date
  amt: number;
  seeds: string[];
  biggestLosses: number;
  biggestWins: number;
  longestWinStreak: number;
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