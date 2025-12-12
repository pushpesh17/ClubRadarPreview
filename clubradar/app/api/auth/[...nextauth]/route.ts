import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

// Get environment variables
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3001";

// Build email server config
const emailServer = process.env.EMAIL_SERVER || {
  host: process.env.EMAIL_SERVER_HOST || "localhost",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  auth: {
    user: process.env.EMAIL_SERVER_USER || "",
    pass: process.env.EMAIL_SERVER_PASSWORD || "",
  },
};

const config = {
  providers: [
    EmailProvider({
      server: emailServer,
      from: process.env.EMAIL_FROM || "noreply@clubradar.com",
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=true",
    error: "/login?error=auth_error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: NEXTAUTH_SECRET,
  trustHost: true, // Required for NextAuth v5
};

// Initialize NextAuth
const { handlers, auth, signIn, signOut } = NextAuth(config);

export { handlers, auth, signIn, signOut };
export const { GET, POST } = handlers;
