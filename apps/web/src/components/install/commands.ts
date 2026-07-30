/** Dual install surfaces — package managers only (PRODUCT / Specs 22–24). */
export const INSTALL_COMMANDS = {
  cli: "npx openwisdom install",
  mcp: "npx -y openwisdom-mcp",
} as const;

export type InstallSurface = keyof typeof INSTALL_COMMANDS;
