"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";

/* -------------------- TYPES -------------------- */

type Step =
  | "email"
  | "form"
  | "otp"
  | "forgot-email"
  | "forgot-otp"
  | "forgot-reset"
  | "success";

/* -------------------- PAGE -------------------- */

export default function AuthPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [step, setStep] = useState<Step>("email");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* -------------------- API HANDLERS -------------------- */

  const login = async () => {
    setLoading(true);
    try {
      await authLogin(email, password);
      toast.success("Welcome back!");
      setStep("success");
      setTimeout(() => router.push("/"), 1500);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    setLoading(true);
    try {
      await api.post("/accounts/signup/", {
        username: email,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      toast.success("OTP sent to email");
      setStep("otp");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      await api.post("/accounts/verify-otp/", { username: email, otp });
      toast.success("Account verified");
      setStep("form");
      setTimeout(() => router.push("/"), 1500);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const requestResetOtp = async () => {
    setLoading(true);
    try {
      await api.post("/accounts/request-reset-otp/", { email });
      toast.success("Reset OTP sent");
      setStep("forgot-otp");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      await api.post("/accounts/reset-password/", {
        email,
        otp,
        new_password: newPassword,
      });
      toast.success("Password reset");
      setStep("form");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_60%)]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <AnimatePresence mode="wait">
          {/* STEP: EMAIL */}
          {step === "email" && (
            <Step key="email">
              <Title>Welcome to I2EDC</Title>
              <Subtitle>Sign in to continue</Subtitle>

              <Input
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />

              <PrimaryButton onClick={() => setStep("form")}>
                Continue
              </PrimaryButton>

              <ToggleLink
                onClick={() => setIsSignUp(!isSignUp)}
                text={
                  isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"
                }
              />
            </Step>
          )}

          {/* STEP: LOGIN / SIGNUP FORM */}
          {step === "form" && (
            <Step key="form">
              <Title>{isSignUp ? "Create Account" : "Enter Password"}</Title>
              <Subtitle>{email}</Subtitle>

              {isSignUp && (
                <>
                  <Input
                    placeholder="First name"
                    value={firstName}
                    onChange={setFirstName}
                  />
                  <Input
                    placeholder="Last name"
                    value={lastName}
                    onChange={setLastName}
                  />
                </>
              )}

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={setPassword}
              />

              <PrimaryButton
                onClick={isSignUp ? signup : login}
                loading={loading}
              >
                {isSignUp ? "Sign up" : "Sign in"}
              </PrimaryButton>

              {!isSignUp && (
                <ToggleLink
                  onClick={() => setStep("forgot-email")}
                  text="Forgot password?"
                />
              )}
            </Step>
          )}

          {/* STEP: OTP */}
          {step === "otp" && (
            <Step key="otp">
              <Title>Verify OTP</Title>
              <Subtitle>Check your email</Subtitle>

              <Input
                placeholder="000000"
                value={otp}
                onChange={setOtp}
                center
              />

              <PrimaryButton onClick={verifyOtp} loading={loading}>
                Verify
              </PrimaryButton>
            </Step>
          )}

          {/* FORGOT: EMAIL */}
          {step === "forgot-email" && (
            <Step key="forgot-email">
              <Title>Reset Password</Title>
              <Subtitle>Enter your email</Subtitle>

              <Input
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />

              <PrimaryButton onClick={requestResetOtp} loading={loading}>
                Send OTP
              </PrimaryButton>
            </Step>
          )}

          {/* FORGOT: OTP */}
          {step === "forgot-otp" && (
            <Step key="forgot-otp">
              <Title>Verify OTP</Title>

              <Input
                placeholder="000000"
                value={otp}
                onChange={setOtp}
                center
              />

              <PrimaryButton onClick={() => setStep("forgot-reset")}>
                Continue
              </PrimaryButton>
            </Step>
          )}

          {/* FORGOT: RESET */}
          {step === "forgot-reset" && (
            <Step key="forgot-reset">
              <Title>New Password</Title>

              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={setNewPassword}
              />

              <PrimaryButton onClick={resetPassword} loading={loading}>
                Reset Password
              </PrimaryButton>
            </Step>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <Step key="success">
              <Title>You're in 🎉</Title>
              <Subtitle>Redirecting…</Subtitle>
            </Step>
          )}
        </AnimatePresence>
      </div>

      {/* BACK + THEME BUTTONS */}
      <div className="absolute bottom-6 left-6">
        <IconButton onClick={() => setStep("email")}>
          <ArrowLeft />
        </IconButton>
      </div>

      <div className="absolute bottom-6 right-6">
        <IconButton
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </IconButton>
      </div>
    </div>
  );
}

/* -------------------- REUSABLE UI -------------------- */

const Step = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.35 }}
    className="space-y-6 text-center"
  >
    {children}
  </motion.div>
);

const Title = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-3xl font-bold">{children}</h1>
);

const Subtitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground">{children}</p>
);

const Input = ({
  placeholder,
  value,
  onChange,
  type = "text",
  center = false,
}: any) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full rounded-full border px-4 py-3 bg-background focus:outline-none ${
      center ? "text-center tracking-widest" : ""
    }`}
  />
);

const PrimaryButton = ({ children, onClick, loading = false }: any) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full rounded-full bg-black text-white py-3 font-medium hover:bg-black/90 transition"
  >
    {loading ? "Please wait…" : children}
  </button>
);

const ToggleLink = ({ onClick, text }: any) => (
  <button
    onClick={onClick}
    className="text-sm text-muted-foreground hover:underline"
  >
    {text}
  </button>
);

const IconButton = ({ children, onClick }: any) => (
  <button
    onClick={onClick}
    className="h-10 w-10 rounded-full border flex items-center justify-center bg-background hover:bg-muted transition"
  >
    {children}
  </button>
);
