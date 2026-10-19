import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
};

const variantClasses = {
  primary: "bg-[#425B9A] text-white hover:bg-[#344979]",
  secondary: "bg-[#76C0EC] text-[#18345C] hover:bg-[#5BAFE3]",
  outline:
    "border border-[#425B9A] bg-transparent text-[#425B9A] hover:bg-[#FFF6DC]",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A] ${
        fullWidth ? "w-full" : ""
      } ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
