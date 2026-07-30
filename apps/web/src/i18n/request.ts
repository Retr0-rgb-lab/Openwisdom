import { getRequestConfig } from "next-intl/server";

// Temporary stub (Plan A Task A.2); replaced by the full locale-aware
// implementation in Task A.6.
export default getRequestConfig(async () => {
  return {
    locale: "zh",
    messages: {},
  };
});
