import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sentra - Advanced Phishing Detection",
  description: "Enterprise-grade AI-powered phishing detection.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let initialLocale: Locale = "en";

  if (session?.user?.language && isLocale(session.user.language)) {
    initialLocale = session.user.language;
  } else {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("preferred_locale")?.value;
    if (isLocale(cookieLocale)) {
      initialLocale = cookieLocale;
    } else {
      const headersList = await headers();
      const acceptLang = headersList.get("accept-language") ?? "";
      initialLocale = acceptLang.toLowerCase().includes("vi") ? "vi" : "en";
    }
  }

  // Always-present locale element — lets the extension sync language even when
  // the user is not authenticated (login page, landing page, etc.).
  const extLocale = JSON.stringify({ language: initialLocale });

  // Auth element — only present when authenticated so the extension clears its
  // stored token when the user logs out.
  const extData = session?.accessToken
    ? JSON.stringify({ token: session.accessToken, email: session.user?.email ?? "", language: initialLocale })
    : null;

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          id="sentra-locale-data"
          type="application/json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: extLocale }}
        />
        {extData && (
          <script
            id="sentra-ext-data"
            type="application/json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: extData }}
          />
        )}
        <AuthProvider>
          <LanguageProvider initialLocale={initialLocale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
