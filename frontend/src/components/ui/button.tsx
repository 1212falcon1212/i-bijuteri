import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-[var(--surface-2)] hover:text-[var(--ink)] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-[var(--surface-2)] hover:text-[var(--ink)] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium editorial variants (handoff design)
        dark: "bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--accent-2)] uppercase tracking-[.14em] font-semibold",
        goldOutline:
          "bg-transparent border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white uppercase tracking-[.14em] font-semibold",
        ghostDark:
          "bg-transparent text-[var(--ink)] border-b border-[var(--ink)] hover:text-[var(--accent-2)] hover:border-[var(--accent-2)] uppercase tracking-[.14em] font-semibold px-0",
        ghostCream:
          "bg-transparent text-[var(--bg)] border-b border-[var(--bg)] hover:text-[var(--accent)] hover:border-[var(--accent)] uppercase tracking-[.14em] font-semibold px-0",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        xl: "h-14 px-9 text-[12px]",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
