
import "./globals.css";
import { CURSOR } from "@/utils/constants";
import Header from "@/components/Header";
import Providers from "./providers";
import VisitorCounter from "@/components/VisitorCounter";

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: any;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className={`min-h-screen justify-center ${CURSOR}`}>
        <Providers>
          <Header />
          <main className="sticky inset-0">{children}</main>
          <VisitorCounter />
          {modal}
        </Providers>
      </body>
    </html>
  );
}
