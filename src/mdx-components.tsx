import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    // Content images (content/docs/**/*.mdx) are no longer bundled by
    // Next.js's image pipeline -- see source.config.ts: remarkImageOptions
    // is disabled and remarkDocImages resolves each image's relative path
    // to its R2-proxied "/docs/hardware/img/..." URL at compile time.
    // Rendered as a plain, zoomable <img> -- no next/image, no
    // width/height needed, so there's nothing to keep in sync when images
    // change.
    img: (props: ComponentPropsWithoutRef<"img">) => {
      if (typeof props.src !== "string") return null;
      const { src, alt, ...rest } = props;
      return (
        // src/alt passed here too, not just to the inner <img>: ImageZoom's
        // zoomed-in view reads its image from these props directly, not
        // from `children` -- omitting them renders a blank zoomed-in image
        // even though the inline thumbnail (via children) looks correct.
        <ImageZoom src={src} alt={alt ?? ""}>
          <img {...rest} src={src} alt={alt ?? ""} loading="lazy" />
        </ImageZoom>
      );
    },
    ...components,
  };
}
