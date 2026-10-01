import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { assetPath } from "@/lib/base-path";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img: ((props: any) => {
      const src =
        typeof props.src === "string" ? assetPath(props.src) : props.src;
      return <ImageZoom {...props} src={src} />;
    }) as NonNullable<MDXComponents["img"]>,
    ...components,
  };
}
