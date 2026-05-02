import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("glass-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "border border-white/14 bg-linear-to-r from-emerald-500/78 via-green-500/72 to-cyan-500/68 text-primary-foreground shadow-[0_16px_40px_rgb(34_197_94_/_0.26)] hover:brightness-110",
            destructive: "border border-red-300/20 bg-linear-to-r from-red-500/70 to-orange-500/70 text-destructive-foreground shadow-[0_16px_34px_rgb(239_68_68_/_0.28)] hover:brightness-110",
            outline: "glass-chip text-foreground hover:bg-white/12 hover:text-white",
            secondary: "border border-white/10 bg-white/8 text-secondary-foreground shadow-[0_10px_30px_rgb(15_23_42_/_0.22)] hover:bg-white/12",
            ghost: "text-foreground hover:bg-white/10 hover:text-white",
            link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 px-3 text-xs",
            lg: "h-11 px-8",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
});
Button.displayName = "Button";
export { Button, buttonVariants };
