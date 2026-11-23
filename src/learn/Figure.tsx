import type { ReactNode } from "react";

type FigureProps = {
  children: ReactNode;
  caption: string;
  dark?: boolean;
};

export function Figure({ children, caption, dark }: FigureProps) {
  return (
    <figure className={dark ? "learn-figure learn-figure--dark" : "learn-figure"}>
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
