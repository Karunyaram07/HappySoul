import { Montserrat, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});


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
      className={`${montserrat.variable} ${robotoCondensed.variable} h-full antialiased`}
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

