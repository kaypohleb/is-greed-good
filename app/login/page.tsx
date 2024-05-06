import { cookies } from "next/headers";

export default function Login() {
  const cookieStore = cookies();
  const loginId = cookieStore.get("gambaId");
  const authToken = cookieStore.get("authToken");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form action="">
        <input className="" type="email" />
        <input className="" type="password" />
      </form>
    </main>
  );
}
