import { auth, signIn, signOut } from "@/auth";
import Image from "next/image";
import GIcon from "@assets/images/G-icon.svg";

export default async function SignInButton() {
  const session = await auth();
  if (session && session.user) {
    return (
      <div className="flex gap-x-2 items-center">
        <div className="text-[16px]">{session.user.name}</div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
            
          }}
        >
          <button
            type="submit"
            className="py-1 px-2 text-black shadow-md border-2 text-[14px] flex justify-center items-center rounded-[3px] windows-button"
          >
            Sign Out
          </button>
        </form>
      </div>
    );
  }
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button
        type="submit"
        className="gap-2 py-1 px-2 text-black shadow-md border-2 text-[14px] flex justify-center items-center rounded-[3px] windows-button"
      >
        <Image src={GIcon} width={16} height={16} alt="G-icon" />
        <div>Sign In</div>
      </button>
    </form>
  );
}
