import { getInstance } from "./index";

const IS_LOCAL = import.meta.env.VITE_ENV === "local" || !import.meta.env.VITE_ENV;

const logCore = (name: string, rawProperties: { [key: string]: unknown } = {}) => {
  // strip undefined fields
  const properties = Object.assign({}, rawProperties);
  Object.keys(properties).forEach((key) => properties[key] === undefined && delete properties[key]);

  if (IS_LOCAL) {
    console.debug(`[Amplitude] Event: ${name}, properties:`, properties);
  } else {
    getInstance().track(name, {
      ...properties,
      environment: process.env.REACT_APP_ENV,
    });
  }
};

export const logPageView = (page: string) => {
  if (page) {
    logCore("web_view_page", {
      page,
    });
  }
};

// Menu bar
export const logClickMenu = () => {
  logCore("click_menu");
};

export const logClickConnectWallet = () => {
  logCore("click_connect_wallet");
};

export const logConnectWalletSuccess = () => {
  logCore("connect_wallet_success");
};

export const logClickBuildYourLink = () => {
  logCore("log_click_build_your_link");
};

// Build page
export const logViewBuildPage = () => {
  logCore("log_view_build_page");
};

export const logEnterTransactionHash = () => {
  logCore("log_enter_transaction_hash");
};

export const logClickAddButton = () => {
  logCore("log_click_add_button");
};

export const logClickGenerateLink = (txInfo?: { methodData: string; txHash: string }[]) => {
  logCore("log_click_generate_link", {
    ...(txInfo && { txInfo }),
  });
};

export const logClickCopyLink = () => {
  logCore("log_click_copy_link");
};

export const logClickPostToTwitter = () => {
  logCore("log_click_post_to_twitter");
};

// View Page
export const logViewLinkPage = () => {
  logCore("log_view_link_page");
};

export const logClickTxDetail = () => {
  logCore("log_click_tx_detail");
};

export const logClickSendTx = () => {
  logCore("log_click_send_tx");
};

export const logFinishSendTx = (txHash: string) => {
  logCore("log_finish_send_tx", { txHash });
};
