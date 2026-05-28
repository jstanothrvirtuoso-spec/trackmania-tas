
import "./globals.css";
import Header from "@/components/Header";
import Providers from "./providers";
import VisitorCounter from "@/components/VisitorCounter";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-screen justify-center cursor-[url('/cursor.png')_0_0,_auto]">
        <Providers>
          <Header />
          <main className="sticky inset-0">{children}</main>
          <VisitorCounter />
        </Providers>
      </body>
    </html>
  );
}
