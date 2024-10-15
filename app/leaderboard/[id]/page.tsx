export default function LeaderboardPage({ params }: { 
  params: { id: string }
 }) {
  return <div>{params.id}</div>;
}
