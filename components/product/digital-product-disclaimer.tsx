import { Info } from "lucide-react";

export function DigitalProductDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-sm border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
      <Info className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground mt-0.5" />
      <p className="leading-relaxed">
        This is a digital product delivered as an instant download. Once the file
        is downloaded, the purchase is considered fulfilled and{" "}
        <strong className="text-foreground">no refunds are issued</strong>. By
        completing checkout you confirm you have read and accept the{" "}
        <a href="/refund-policy" className="underline hover:text-foreground">
          refund policy
        </a>{" "}
        and{" "}
        <a href="/terms" className="underline hover:text-foreground">
          terms of service
        </a>
        .
      </p>
    </div>
  );
}
