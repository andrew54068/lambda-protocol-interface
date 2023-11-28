import Web3 from "web3";

export default async function getTxInfo(
  txHashes: string[]
): Promise<{ data: string | undefined; to: string | null | undefined; value: string }[]> {
  const web3 = new Web3(new Web3.providers.HttpProvider(import.meta.env.VITE_APP_RPC));
  const results = await Promise.all(
    txHashes.map(async (txHash) => {
      const txResult = await web3.eth.getTransaction(txHash);
      console.log("txResult :", txResult);
      return {
        data: txResult.data,
        to: txResult.to,
        value: `${Number(txResult.value)}`,
        from: txResult.from,
        txHash,
      };
    })
  );

  return results;
}
