import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Noto_Sans_SC,
  Noto_Serif_SC,
  Source_Serif_4,
} from "next/font/google";

// Direction B typography (specs/02 §5):
// serif for ideas (display/titles), sans for tools (UI/body), mono for code.

export const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const fontSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-serif-sc",
  display: "swap",
});

export const fontSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-sans-sc",
  display: "swap",
});

export const fontVariables = [
  fontSerif.variable,
  fontSans.variable,
  fontMono.variable,
  fontSerifSC.variable,
  fontSansSC.variable,
].join(" ");
