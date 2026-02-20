import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Provider";
import { Toaster } from "sonner";

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
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        <Providers>
          <div className="
            mx-auto 
           sm:px-8 md:px-12 lg:px-2 xl:px-2 
            max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-7xl xl:max-w-full
          "
          >
            {children}
          </div>
          <Toaster
            position="top-right"
            expand={true}
            richColors={true}
            closeButton={true}
          />
        </Providers>
      </body>
    </html>
  );
}
