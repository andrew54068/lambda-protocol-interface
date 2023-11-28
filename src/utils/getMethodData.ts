import abiDecoder from "abi-decoder";
import Web3 from "web3";
import getABI from "./getABI";

export default async function getMethodData(contractABI, chainId: number, contract: string, callData?: string) {
  if (!callData) return null;
  if (!contractABI || contractABI == "") return null;
  const web3 = new Web3();
  abiDecoder.addABI(contractABI);

  const decodedData = abiDecoder.decodeMethod(callData);
  console.log(`💥 decodedData: ${JSON.stringify(decodedData, null, "  ")}`);

  abiDecoder.removeABI(contractABI);
  if (!decodedData || Object.keys(decodedData).length === 0) {
    // might be due to it's proxy contract
    const proxyContract = new web3.eth.Contract(contractABI, contract);
    const implementationAddress = await proxyContract.methods.implementation().call();
    console.log(`💥 implementationAddress: ${JSON.stringify(implementationAddress, null, "  ")}`);
    if (typeof implementationAddress === "string") {
      const impABI = await getABI(chainId, implementationAddress);
      abiDecoder.addABI(impABI);
      const decodedData = abiDecoder.decodeMethod(callData);
      abiDecoder.removeABI(impABI);
      return decodedData;
    }
    return null;
  }

  return decodedData;
}
