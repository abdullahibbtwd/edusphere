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
        <div  className="
            mx-auto 
            px-4 sm:px-8 md:px-12 lg:px-2 xl:px-2 
            max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-7xl xl:max-w-full
          "
        >
          {children}
        </div>
      </Providers>
    </body>
  </html>
);
}
