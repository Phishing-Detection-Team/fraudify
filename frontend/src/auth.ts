import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { config } from "./lib/config";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("AUTHORIZE CALLED WITH:", credentials);
        if (!credentials?.email || !credentials?.password) return null;
        
        const { email, password } = credentials;

        console.log("DEMO ACCOUNTS CONFIG:", config.DEMO_ACCOUNTS);

        // Check Demo Admin
        if (email === config.DEMO_ACCOUNTS.ADMIN.email && password === config.DEMO_ACCOUNTS.ADMIN.password) {
          console.log("MATCHED ADMIN!");
          return { id: "demo-admin", name: "Demo Admin", email: email as string, role: "admin" };
        }
        
        // Check Demo User
        if (email === config.DEMO_ACCOUNTS.USER.email && password === config.DEMO_ACCOUNTS.USER.password) {
          console.log("MATCHED USER!");
          return { id: "demo-user", name: "Demo User", email: email as string, role: "user" };
        }

        console.log("FAILED MATCH!");
        // Add real backend authentication check here later
        
        return null;
      }
    })
  ]
});
