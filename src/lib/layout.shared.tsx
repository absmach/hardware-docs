import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared";
import { LayoutTemplate } from "lucide-react";
import { assetPath } from "./base-path";

export const linkItems: LinkItemType[] = [
  {
    type: "icon",
    text: "Blog",
    url: "https://www.absmach.eu/blog/?category=hardware",
    icon: <LayoutTemplate />,
    active: "url",
  },
];

export const logo = (
  <>
    <div className="flex items-center space-x-2">
      <img
        src={assetPath("/logo-black.svg")}
        className="h-10 w-auto dark:hidden"
        alt="Abstract Machines logo"
        width={1700}
        height={1600}
      />
      <img
        src={assetPath("/logo-white.svg")}
        className="h-10 w-auto hidden dark:block"
        alt="Abstract Machines logo"
        width={1700}
        height={1600}
      />
      Hardware
    </div>
  </>
);

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: true,
    },
    searchToggle: {
      enabled: true,
    },
    githubUrl: "https://github.com/absmach/s0",
    nav: {
      title: <>{logo}</>,
      transparentMode: "top",
    },
    links: linkItems,
  };
}
