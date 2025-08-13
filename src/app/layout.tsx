import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Provider";

export const metadata: Metadata = {
  title: "EduSphere",
  description: "Multi Tenant School platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
