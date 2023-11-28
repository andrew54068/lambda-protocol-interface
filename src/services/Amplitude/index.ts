// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export * from "./log";

import * as amplitude from "@amplitude/analytics-browser";
import noop from "lodash/noop";

export const getInstance = () => {
  if (!amplitude) {
    return {
      init: noop,
      track: noop,
    };
  }

  return amplitude;
};

export const initAmplitude = () => {
  amplitude.init(import.meta.env.VITE_APP_AMPLITUDE_KEY, "", {
    disableCookies: true,
    storage: "localStorage",
  });
};

export const setUserId = (userId) => getInstance().setUserId(userId);
