import getTransactionReceipt from "./getTransactionReceipt";
import strip0x from "./strip0x";
import erc721Abi from "src/abis/erc721Abi";
import { web3 } from "src/services/evm";
import { Contract } from "web3";
import { decode } from "js-base64";

type NFTInfo = {
  name: string;
  description: string;
  image: string;
  address: string;
  tokenId: string;
};

export default async function getMintedNFT(txHash: string, receivedAccount: string) {
  try {
    const txResult = await getTransactionReceipt(txHash);
    if (!txResult) return [];
    const { logs } = txResult;

    const transferEventSignature = web3.utils.sha3("Transfer(address,address,uint256)");

    // get the transfer events
    const transferEvents = logs.filter((log) => {
      return (
        log.topics?.[0].toString() === transferEventSignature &&
        log.topics?.[2]
          ?.toString()
          .toLocaleLowerCase()
          .includes(strip0x(receivedAccount?.toLocaleLowerCase()))
      );
    });

    if (transferEvents.length === 0) return [];

    // get the minted NFT contract info
    const mintedNFTInfo = transferEvents.map((log) => {
      return {
        contractAddress: log.address,
        tokenId: web3.utils.hexToNumber(log?.topics?.[3]?.toString() || ""),
      };
    });

    const mintedNFTDisplayInfo = await Promise.all(
      mintedNFTInfo.map(async (info) => {
        const nftContract = new Contract(erc721Abi, info.contractAddress, web3);
        // the workaround for the type bug from web3.js v4
        try {
          const tokenURI = await (nftContract.methods.tokenURI as any)(info.tokenId).call();
          const decodedTokenURI = decode(tokenURI.split(";base64,")[1]) || "";
          const decodedTokenURIObject = decodedTokenURI ? JSON.parse(decodedTokenURI) : undefined;
          const { name, description, image } = decodedTokenURIObject || {};
          return {
            name,
            description,
            image,
            address: info?.contractAddress || "",
            tokenId: `${info.tokenId}`,
          };
        } catch (err) {
          console.error("Error while parsing mintedNFTInfo", err);
          return {
            address: info?.contractAddress || "",
            tokenId: `${info.tokenId}`,
          };
        }
      })
    );

    const filteredMintedInfo = mintedNFTDisplayInfo.filter((info): info is NFTInfo => info !== undefined);
    return filteredMintedInfo;
  } catch (err) {
    console.error("Error in getMintedNFT", err);
    return [];
  }
}
