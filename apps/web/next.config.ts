import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // SPE 37 P1-a: allow catalogIndexSchema from workspace package
  transpilePackages: ["@openwisdom/schema"],
};

export default withNextIntl(nextConfig);
