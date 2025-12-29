// app/ClientLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import { IsMobileProvider } from "../context/IsMobileContext";
import { ScrollProvider } from "@/context/ScrollContext";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ContentProvider } from "@/context/ContentContext";
import FloatingActionButton from "@/components/FloatingActionButton";

/* -------------------- WRAPPERS -------------------- */

function PreWrapper({ children }: { children: React.ReactNode }) {
  return (
    <IsMobileProvider>
      <ScrollProvider>{children}</ScrollProvider>
    </IsMobileProvider>
  );
}

/* -------------------- AUTH GATE -------------------- */

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}

/* -------------------- CLIENT LAYOUT -------------------- */

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  return (
      <ContentProvider>
        <PreWrapper>
          {isAuthRoute ? (
            /* 🔓 AUTH ROUTES — no header/footer, no auth gate */
            children
          ) : (
            /* 🔐 APP ROUTES — wait for auth resolution */
            <AuthGate>
              <Header />
              {children}
              <FloatingActionButton />
              <Footer />
            </AuthGate>
          )}
        </PreWrapper>
      </ContentProvider>
  );
}
