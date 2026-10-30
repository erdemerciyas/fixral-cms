import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* Printables şekil dili: buton radius 8px (public scope --radius), dinlenimde
 * gölge yok, hover'da yalnızca zemin/kenar değişir, tıklamada 0.98 press. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium tracking-[0.01em] leading-5 transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary)/0.85)]",
        primary:
          "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary)/0.85)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[hsl(var(--destructive)/0.85)]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border border-border bg-secondary text-primary hover:border-primary/40 hover:bg-accent",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        link: "text-info underline-offset-4 hover:underline active:scale-100",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-[hsl(var(--destructive)/0.85)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
