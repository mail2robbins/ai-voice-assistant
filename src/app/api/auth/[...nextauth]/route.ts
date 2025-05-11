import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Extend the built-in types
interface ExtendedUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  email?: string | null;
  image?: string | null;
  name?: string | null;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
}

interface ExtendedToken extends JWT {
  firstName?: string;
  lastName?: string;
  gender?: string;
}

interface ExtendedProfile {
  given_name?: string;
  family_name?: string;
  gender?: string;
  email?: string;
  picture?: string;
  name?: string;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'openid email profile',
          access_type: 'offline',
          response_type: 'code'
        }
      }
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
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const googleProfile = profile as ExtendedProfile;
        const extendedUser = user as ExtendedUser;
        extendedUser.firstName = googleProfile?.given_name;
        extendedUser.lastName = googleProfile?.family_name;
        extendedUser.gender = googleProfile?.gender;
      }
      return true;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          firstName: (token as ExtendedToken).firstName,
          lastName: (token as ExtendedToken).lastName,
          gender: (token as ExtendedToken).gender
        }
      };
    },
    async jwt({ token, user, account, profile }): Promise<ExtendedToken> {
      if (profile) {
        const googleProfile = profile as ExtendedProfile;
        token.firstName = googleProfile.given_name;
        token.lastName = googleProfile.family_name;
        token.gender = googleProfile.gender;
      }
      if (user) {
        token.sub = user.id;
      }
      return token as ExtendedToken;
    },
  },
});

export { handler as GET, handler as POST }; 