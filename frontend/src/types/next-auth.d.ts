
import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import type { Locale } from "@/lib/i18n";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    fromDemo?: boolean;
    fromBackend?: boolean;
    accessToken?: string;
    refreshToken?: string;
    language?: Locale;
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id?: string;
      role?: string;
      fromDemo?: boolean;
      fromBackend?: boolean;
      language?: Locale;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    fromBackend?: boolean;
    fromDemo?: boolean;
    id?: string;
    language?: Locale;
  }
}
