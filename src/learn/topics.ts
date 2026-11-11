import type { ComponentType } from "react";
import { AstrologicalZodiac } from "./AstrologicalZodiac";
import { SiderealTime } from "./SiderealTime";

export type DeepDiveTopic = {
  slug: string;
  title: string;
  dek: string;
  Content: ComponentType;
};

// Each entry is a self-contained deep-dive article, reachable at
// #learn/<slug>. Add more here as new tangents get written up -- the page
// chrome (LearnPage) is shared, so a new topic is just a new entry plus its
// own content component.
export const DEEP_DIVE_TOPICS: Record<string, DeepDiveTopic> = {
  "sidereal-time": {
    slug: "sidereal-time",
    title: "What is Local Sidereal Time, and why does the Pražský Orloj keep track of it?",
    dek: "A four-minute-a-day gap between the sun's clock and the stars' — and the reason a 15th-century clockmaker thought it was worth building into gears.",
    Content: SiderealTime,
  },
  "astrological-zodiac": {
    slug: "astrological-zodiac",
    title: "The Astrological Zodiac",
    dek: "The twelve signs circling the Orloj's dial, with their glyphs, elements, classical rulers, and traditional date ranges.",
    Content: AstrologicalZodiac,
  },
};
