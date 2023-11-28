import { web3 } from "src/services/evm";
import { TransactionReceipt } from "web3";

export default function getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      let txResult;
      try {
        txResult = await web3.eth.getTransactionReceipt(txHash);
        if (txResult) {
          clearInterval(interval);
          resolve(txResult);
        }
      } catch (e) {
        // ignore the error for op
        // the page will not be found in the first few seconds after tx has been sent.
        // clearInterval(interval);
        // reject(e);
      }

      return txResult;
    }, 3000);
  });
}
