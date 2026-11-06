import type { ReactNode } from "react";

type FigureProps = {
  children: ReactNode;
  caption: string;
};

export function Figure({ children, caption }: FigureProps) {
  return (
    <figure className="learn-figure">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
