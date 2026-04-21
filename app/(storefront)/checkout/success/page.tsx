import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Purchase Complete!</h1>
          <p className="text-muted-foreground">
            Your download is ready. Head to your downloads to access your files.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/downloads"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Downloads
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
