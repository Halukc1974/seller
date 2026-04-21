import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireCreator() {
  const session = await requireAuth();
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    redirect("/become-creator");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
