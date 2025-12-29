// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

/* ---------------- FONTS ---------------- */

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

/* ---------------- META ---------------- */

export const metadata: Metadata = {
  title: "I2EDC | IIT Jammu",
  description:
    "Innovation, Incubation & Entrepreneurship Development Cell – IIT Jammu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable}`}
    >
      <body className="antialiased min-h-screen font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <Toaster
            richColors
            position="bottom-right"
            toastOptions={{ className: "glass" }}
          />

          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
