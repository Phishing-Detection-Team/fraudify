import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "admin" ? "/dashboard/admin" : "/dashboard/user");
  }
  return <LandingPage />;
}
