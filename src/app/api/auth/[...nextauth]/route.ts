import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Enable debug logs
  // logger: {
  //   error: (code, metadata) => {
  //     console.error('AUTH ERROR:', code, metadata);
  //   },
  //   warn: (code) => {
  //     console.warn('AUTH WARN:', code);
  //   },
  //   debug: (code, metadata) => {
  //     console.log('AUTH DEBUG:', code, metadata);
  //   },
  // },
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub
        }
      };
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 