import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const ALLOWED_GITHUB_USER = "chainstrument"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn({ profile }) {
      return profile?.login === ALLOWED_GITHUB_USER
    },
  },
})
