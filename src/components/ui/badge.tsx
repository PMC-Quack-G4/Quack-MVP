import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-quack-amber focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-quack-amber text-quack-gunmetal hover:bg-quack-sandy",
        secondary:
          "border-transparent bg-quack-dandelion text-quack-gunmetal hover:bg-amber-200",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "text-quack-gunmetal border-2 border-slate-200",
        success:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
