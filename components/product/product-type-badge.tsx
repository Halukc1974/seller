import { Layout, Code, Palette, GraduationCap, Key, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_MAP: Record<string, { icon: React.ElementType; label: string }> = {
  TEMPLATE: { icon: Layout, label: "Template" },
  SOFTWARE: { icon: Code, label: "Software" },
  ASSET: { icon: Palette, label: "Asset" },
  COURSE: { icon: GraduationCap, label: "Course" },
  LICENSE: { icon: Key, label: "License" },
  OTHER: { icon: Package, label: "Other" },
};

interface ProductTypeBadgeProps {
  type: string;
  className?: string;
}

function ProductTypeBadge({ type, className }: ProductTypeBadgeProps) {
  const config = TYPE_MAP[type] ?? TYPE_MAP.OTHER;
  const Icon = config.icon;
  return (
    <Badge variant="secondary" className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export { ProductTypeBadge };
