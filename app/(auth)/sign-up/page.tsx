"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAction } from "./actions";
import StayoraLogo from "@/components/ui/stayora-logo";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { signUpSchema } from "@/lib/validations/auth";

export default function SignUpPage() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(signUpAction, {
    error: null,
    success: false,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameResult =
    name.length === 0 ? null : signUpSchema.shape.name.safeParse(name);

  const nameError =
    nameResult && !nameResult.success
      ? nameResult.error.issues[0].message
      : null;

  const nameIsValid = nameResult !== null && nameResult.success;

  const emailError =
    email.length === 0
      ? null
      : signUpSchema.shape.email.safeParse(email).success
        ? null
        : "Please enter a valid email address.";

  const emailIsValid = email.length > 0 && emailError === null;

  const passwordError =
    password.length === 0
      ? null
      : password.length < 8
        ? "Password must be at least 8 characters."
        : null;

  const passwordIsValid = password.length >= 8;

  const confirmPasswordError =
    confirmPassword.length === 0
      ? null
      : confirmPassword !== password
        ? "Passwords do not match."
        : password.length < 8
          ? "Password must be at least 8 characters."
          : null;

  const confirmPasswordIsValid =
    confirmPassword.length > 0 &&
    confirmPassword === password &&
    passwordIsValid;

  const isFormValid =
    nameIsValid && emailIsValid && passwordIsValid && confirmPasswordIsValid;

  useEffect(() => {
    if (state.success) {
      router.push("/hotels");
    }
  }, [state.success, router]);

  return (
    <section className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
      <div className="mb-8 text-center">
        <div className="mb-6 flex justify-center">
          <StayoraLogo className="[&>span:last-child]:text-[#425B9A]" />
        </div>

        <h1 className="text-2xl font-bold text-[#425B9A]">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign up to start booking your next stay.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-[#425B9A]"
          >
            Full name
          </label>

          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? "name-error" : undefined}
              className={`w-full rounded-xl border bg-[#FFF6DC]/40 px-4 py-3 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                nameError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                  : nameIsValid
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/15"
                    : "border-[#425B9A]/15 focus:border-[#425B9A] focus:ring-[#425B9A]/15"
              }`}
            />

            {nameIsValid && (
              <CheckCircle2
                aria-label="Valid name"
                className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-green-600"
              />
            )}
          </div>

          {nameError && (
            <p
              id="name-error"
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[#425B9A]"
          >
            Email address
          </label>

          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              aria-invalid={emailError !== null}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`w-full rounded-xl border bg-[#FFF6DC]/40 px-4 py-3 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                emailError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                  : emailIsValid
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/15"
                    : "border-[#425B9A]/15 focus:border-[#425B9A] focus:ring-[#425B9A]/15"
              }`}
            />

            {emailIsValid && (
              <CheckCircle2
                aria-label="Valid email"
                className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-green-600"
              />
            )}
          </div>

          {emailError && (
            <p
              id="email-error"
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#425B9A]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              aria-invalid={passwordError !== null}
              aria-describedby={passwordError ? "password-error" : undefined}
              className={`w-full rounded-xl border bg-[#FFF6DC]/40 px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                  : passwordIsValid
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/15"
                    : "border-[#425B9A]/15 focus:border-[#425B9A] focus:ring-[#425B9A]/15"
              }`}
            />

            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {passwordIsValid && (
                <CheckCircle2
                  aria-label="Valid password"
                  className="size-5 text-green-600"
                />
              )}

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-gray-500 transition hover:text-[#425B9A]"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {passwordError && (
            <p
              id="password-error"
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {passwordError}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Use at least 8 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-[#425B9A]"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              aria-invalid={confirmPasswordError !== null}
              aria-describedby={
                confirmPasswordError ? "confirm-password-error" : undefined
              }
              className={`w-full rounded-xl border bg-[#FFF6DC]/40 px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                confirmPasswordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                  : confirmPasswordIsValid
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/15"
                    : "border-[#425B9A]/15 focus:border-[#425B9A] focus:ring-[#425B9A]/15"
              }`}
            />

            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {confirmPasswordIsValid && (
                <CheckCircle2
                  aria-label="Passwords match"
                  className="size-5 text-green-600"
                />
              )}

              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="text-gray-500 transition hover:text-[#425B9A]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {confirmPasswordError && (
            <p
              id="confirm-password-error"
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {confirmPasswordError}
            </p>
          )}
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !isFormValid}
          className="w-full rounded-full bg-[#425B9A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344979] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-[#425B9A] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
