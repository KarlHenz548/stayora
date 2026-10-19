import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF6DC] px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
