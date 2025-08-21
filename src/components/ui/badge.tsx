import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-medium",
        secondary:
          "border-transparent bg-gradient-secondary text-secondary-foreground shadow-soft hover:shadow-medium",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline: "text-foreground border-border hover:bg-accent/50",
        success:
          "border-transparent bg-success text-success-foreground shadow-soft",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow-soft",
        info:
          "border-transparent bg-info text-info-foreground shadow-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
