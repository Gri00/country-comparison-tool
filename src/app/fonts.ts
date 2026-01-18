import { Playfair_Display } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import { Sora } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
});

export const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
