import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://riceme.roedzn.tech/"),
  title: "RiceMe",
  description:
    "RiceMe: generate dynamic terminal-style SVG cards for GitHub READMEs with 23+ color themes.",
  openGraph: {
    title: "RiceMe",
    description:
      "RiceMe: generate dynamic terminal-style SVG cards for GitHub READMEs with 23+ color themes.",
    type: "website",
    images: [{ url: "/og-image.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/og-image.webp", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <footer className="px-4 pb-6 sm:px-8">
              <div className="mx-auto max-w-7xl rounded-xl border-2 border-border bg-card/40 p-4 text-xs text-muted-foreground">
                <p className="mb-1">
                  <span className="text-term-green">~</span>{" "}
                  <span className="text-term-blue">❯ </span> riceme · Solenad
                </p>
                <p>
                  <span className="text-term-green">~</span>{" "}
                  <span className="text-term-blue">❯</span>{" "}
                  <a
                    href="https://github.com/Solenad/riceme-readme-generator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-term-cyan hover:underline"
                  >
                    star on github
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://github.com/Solenad/riceme-readme-generator/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-term-red hover:underline"
                  >
                    report bug
                  </a>
                </p>
              </div>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
