import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Rubik } from "next/font/google";
import { Provider } from "@/components/provider";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import "./global.css";
import type { Metadata } from "next";

const rubik = Rubik({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  preload: true,
  variable: "--font-rubik",
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.absmach.eu/docs/hardware";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s — Hardware Docs",
    default: "Documentation — Abstract Machines Hardware",
  },
  description:
    "Open-source IoT gateway hardware documentation. S0 and S1 gateways for smart metering, industrial IoT, and edge computing.",
};

export default function Layout({ children }: LayoutProps<"/">) {
  const base = baseOptions();
  return (
    <html lang="en" className={rubik.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-(family-name:--font-rubik)">
        <Provider>
          <DocsLayout
            {...base}
            tree={source.getPageTree()}
            links={base.links?.filter((item) => item.type === "icon")}
            nav={{ ...base.nav }}
          >
            {children}
          </DocsLayout>
        </Provider>
      </body>
    </html>
  );
}
