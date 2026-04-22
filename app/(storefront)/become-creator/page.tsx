import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BecomeCreatorForm } from "@/components/creator/become-creator-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Start selling on Seller",
  description: "Open your creator store on Seller and list digital products.",
};

export default async function BecomeCreatorPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/become-creator");
  }

  const existing = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) {
    redirect("/creator/products");
  }

  return <BecomeCreatorForm />;
}
