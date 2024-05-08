import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { UnstorageAdapter } from "@auth/unstorage-adapter"
import storage from "./store";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: UnstorageAdapter(storage),
  callbacks:{
    session({session, user}) {
      session.user.id = user.id
      return session
    }
  }
});
