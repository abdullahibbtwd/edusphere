import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Provider";
import Navbar from "@/components/NavBar";


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
          <Navbar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
