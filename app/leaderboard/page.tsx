//if not played today, redirect to play
// TODO - Add a leaderboard page that shows the user's score, percentile, and betting style
export default function Leaderboard() {
  return (
    <div>
      <h1>Leaderboard</h1>
      <div>your score: 0</div>
      <div>you were the top % of players that played today</div>
      <div>
        How well you betted today vs others
        <div>
          Biggest Losses
          <div>Bar showing percetile</div>
          Biggest Wins (+Bet)
          <div>Bar showing percentile</div>
          Most Bets Most Wins in a row
        </div>
        YOu stuck to your guns and betted the same amount
        <div>
          SUMMARIZED BETTING STYLE BY CHATGPT - YOu stuck to your guns and
          betted the same amount - You were a high roller - You were a low
          roller - YOu explored different betting strategies
        </div>
      </div>
    </div>
  );
}
