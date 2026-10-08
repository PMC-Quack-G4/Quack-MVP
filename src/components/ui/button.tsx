import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quack-amber disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-quack-amber text-quack-gunmetal hover:bg-quack-sandy font-bold",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 font-bold",
        outline:
          "border-2 border-quack-amber bg-transparent text-quack-gunmetal hover:bg-quack-dandelion font-bold",
        secondary:
          "bg-quack-dandelion text-quack-gunmetal hover:bg-amber-200 font-bold",
        ghost: "hover:bg-slate-100 text-quack-gunmetal font-bold",
        link: "text-quack-amber font-bold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2 text-base",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
