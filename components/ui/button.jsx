import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:opacity-95",
  secondary: "bg-muted-bg text-foreground hover:bg-border/70",
  outline: "border border-border bg-card text-foreground shadow-sm hover:bg-muted-bg",
  ghost: "text-foreground hover:bg-muted-bg",
  destructive: "bg-danger text-white shadow-sm hover:opacity-90",
};

const sizes = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-11 gap-2 rounded-xl px-5 text-sm",
  icon: "h-9 w-9 rounded-lg",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}