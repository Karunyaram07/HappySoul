// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = {
  variable: "font-sans",
};

const geistMono = {
  variable: "font-mono",
};

export const metadata = {
  title: "Happy Soul – AI Spiritual Wellness & Mindfulness Companion",
  description: "Nurture your mindset, find inner peace, track your daily mood, write a reflection journal, and receive spiritual wisdom inspired by the Bhagavad Gita.",
  keywords: ["wellness", "mindfulness", "spirituality", "Gita AI", "meditation", "yoga", "mood tracker", "gratitude journal"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

