import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md": variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-transparent hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          },
          {
            "h-8 px-3 text-sm gap-1.5": size === "sm",
            "h-10 px-4 text-sm gap-2": size === "md",
            "h-12 px-6 text-base gap-2.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
export type { ButtonProps };
