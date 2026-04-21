import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">Seller.</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
