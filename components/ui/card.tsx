import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "glass" | "gradient" | "elevated";
}

function Card({ className, variant = "default", ...props }: CardProps) {
  const variantClasses = {
    default: "rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200",
    glass: "card-glass rounded-xl border text-card-foreground shadow-lg hover:shadow-xl transition-all duration-200",
    gradient: "rounded-xl border bg-gradient-to-br from-card to-card/80 text-card-foreground shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
    elevated: "card-elevated rounded-xl border bg-card text-card-foreground transition-all duration-200",
  };

  return (
    <div
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
