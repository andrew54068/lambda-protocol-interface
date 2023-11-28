import React, { useEffect, useState, useContext } from "react";
import {
  AccordionPanel,
  AccordionIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  Flex,
  Box,
  VStack,
  Text,
  useToast,
  Icon,
  Grid,
  GridItem,
  Spinner,
} from "@chakra-ui/react";
import { GlobalContext } from "src/context/global";
import { WarningIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";
import Button from "src/components/Button";
import queryString from "query-string";
import { bloctoSDK, useEthereum } from "src/services/evm";
import strip0x from "src/utils/strip0x";
import toHex from "src/utils/toHex";
import getDoNothingTxData from "src/utils/getDoNothingTxData";
import { DISCOUNT_CONTRACT_OP, ADDR_PLACEHOLDER } from "src/constants";
import WalletIcon from "src/assets/wallet.svg?react";
import useScanTxLink from "src/hooks/useScanTxLink";
import getMintedNFT from "src/utils/getMintedNFT";
import { getNetworkScanInfo } from "src/utils/networkScanInfo";
import { logClickConnectWallet } from "src/services/Amplitude";
import { logViewLinkPage, logClickTxDetail, logClickSendTx, logFinishSendTx } from "src/services/Amplitude";

interface TxParameter {
  name: string;
  value: string;
}

interface TransactionInfo {
  data: string;
  to: string;
  value: string;
  name: string;
  methodData: {
    name: string;
    parameters: {
      name: string;
      value: string;
    }[];
  };
  parameters: TxParameter[];
}

const ViewTransaction: React.FC = () => {
  const location = useLocation();
  const { account, connect } = useEthereum();
  const { chainId } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsingNFT, setIsParsingNFT] = useState<boolean>(false);
  const [displayTxInfo, setDisplayTxInfo] = useState<TransactionInfo[]>([]);
  const [mintedNFTs, setMintedNFTs] = useState<
    {
      name: any;
      image: any;
      description: any;
      tokenId: string;
      address: string;
    }[]
  >([]);
  const toast = useToast();

  useEffect(() => {
    logViewLinkPage();
    //@todo : remove testing code.
    // (async function () {
    //   console.log("account :", account);
    //   if (!account) return;
    //   const result = await getMintedNFT("0xf295c9240fe70b13b8a8bde89940cc4e4c6b5a449aca42f12e5b939ecd81871c", account);
    //   console.log("result :", result);
    //   if (result?.length > 0) {
    //     setMintedNFTs(result);
    //   }
    // })();
  }, []);

  useEffect(() => {
    const parsed = queryString.parse(location.search);

    const txInfo: TransactionInfo[] = JSON.parse((parsed.txInfo as string) || "[]");
    if (!account) return;
    // replace all ADDR_PLACEHOLDER with the address of the user
    const transformedTxInfo = txInfo.map((tx) => {
      const tempTx = tx.data.replace(new RegExp(`${ADDR_PLACEHOLDER}`, "g"), strip0x(account));
      return {
        ...tx,
        data: tempTx,
      };
    });
    setDisplayTxInfo(transformedTxInfo);
  }, [account, location.search]);

  // we only support optimism for now
  const scanTxLink = useScanTxLink(chainId || 10);
  const onClickSendTx = async () => {
    if (!account) return;
    logClickSendTx();
    setIsLoading(true);

    const rawTx = [
      ...displayTxInfo,
      {
        from: account,
        to: DISCOUNT_CONTRACT_OP,
        data: getDoNothingTxData(),
        value: "0x0",
      },
    ].map((tx) => {
      return {
        from: account,
        to: tx.to,
        data: tx.data,
        value: tx.value ? `0x${toHex(Number(tx.value))}` : "0x0",
      };
    });

    const batchTransactions = await Promise.all(
      rawTx.map(async (tx) => {
        return {
          method: "eth_sendTransaction",
          params: [tx],
        };
      })
    );

    try {
      const txHash = await bloctoSDK.ethereum.request({
        method: "blocto_sendBatchTransaction",
        params: batchTransactions,
      });

      const parsedHash = Array.isArray(txHash) ? txHash[0] : txHash;

      toast({
        status: "success",
        position: "top",
        duration: null,
        isClosable: true,
        containerStyle: {
          marginTop: "20px",
        },
        render: () => (
          <Flex alignItems="center" bg="green.500" color="white" padding="20px" borderRadius="12px">
            <Link to={scanTxLink + parsedHash} target="_blank" style={{ textDecoration: "underline" }}>
              <Icon as={WarningIcon} mr="8px" />
              Your Transaction is successfully sent!
            </Link>
            <Box onClick={() => toast.closeAll()} ml="8px" cursor="pointer" p="4px">
              <SmallCloseIcon />
            </Box>
          </Flex>
        ),
      });
      logFinishSendTx(parsedHash);
      setIsParsingNFT(true);
      const mintedNFTs = await getMintedNFT(parsedHash, account);
      console.log("mintedNFTs :", mintedNFTs);

      if (mintedNFTs.length > 0) {
        setMintedNFTs(mintedNFTs);
      }
    } catch (err) {
      console.error("Error when sending tx", err);
    }
    setIsParsingNFT(false);
    setIsLoading(false);
  };

  const onClickConnect = () => {
    connect();
    logClickConnectWallet();
  };

  const scanLink = getNetworkScanInfo(chainId || 10)?.scan;
  return (
    <Box p="20px" mt="75px" mb="75px">
      <Text fontSize="xl" mb={5}>
        View Your Transaction
      </Text>

      {account ? (
        <Accordion defaultIndex={[0]} allowMultiple>
          {displayTxInfo.map((tx, index) => (
            <VStack
              key={index}
              align="start"
              spacing={3}
              mb={4}
              borderRadius="12px"
              boxShadow="0px 0px 20px 0px rgba(35, 37, 40, 0.05);"
            >
              <AccordionItem border={0} width="100%" onClick={logClickTxDetail}>
                <h2>
                  <AccordionButton p="space.l">
                    <Box as="span" flex="1" textAlign="left" fontSize="size.heading.5" fontWeight="600">
                      {tx?.methodData.name ? `Possible Intent: ${tx?.methodData.name}` : "Transaction - " + index}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text wordBreak="break-all" textAlign="start" mb="space.s">
                    <Box as="span" fontWeight="bold">
                      {" "}
                      Data:{" "}
                    </Box>
                    {tx.data}
                  </Text>
                  <Flex>
                    <Text fontWeight="bold">To:</Text>
                    <Box as="span" ml="4px" wordBreak="break-all">
                      {tx.to}
                    </Box>
                  </Flex>

                  {tx?.methodData.parameters &&
                    tx?.methodData?.parameters?.map((param, pIndex) => (
                      <Flex key={pIndex}>
                        <Text fontWeight="bold">{param.name}</Text>
                        <Box as="span"> : </Box>
                        <Text ml="4px"> {param.value}</Text>
                      </Flex>
                    ))}
                </AccordionPanel>
              </AccordionItem>
            </VStack>
          ))}
        </Accordion>
      ) : (
        <Flex direction="column" alignItems="center" h="calc(100vh - 75px)" mt="80px">
          <WalletIcon width="72px" height="72px" />
          <Text mt="space.s" mb="space.3xl" textAlign="center">
            You need to connect your wallet to view your transaction.
          </Text>
          <Button w="100%" onClick={onClickConnect} variant="support">
            Connect Wallet
          </Button>
        </Flex>
      )}

      {isParsingNFT && (
        <Flex direction="column" alignItems="center" h="calc(100vh - 75px)" mt="80px">
          <Spinner size="xl" />
          <Text mt="space.s" mb="space.3xl" textAlign="center">
            Parsing your NFTs. Please wait...
          </Text>
        </Flex>
      )}

      {mintedNFTs.length > 0 && (
        <Box mt="space.5xl">
          <Text fontSize="xl" mb={5}>
            NFT You Minted
          </Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {mintedNFTs.map((nft, index) => (
              <GridItem key={index} w="100%" h="100%">
                {scanLink ? (
                  <Link to={scanLink + "/token/" + nft.address} target="_blank">
                    <Box
                      key={index}
                      mr="space.l"
                      pb="100%"
                      minW="100%"
                      boxShadow="xl"
                      rounded="md"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor="gray.200"
                      backgroundColor="gray.200"
                      position="relative"
                    >
                      <img
                        src={nft.image}
                        alt={nft.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                        onError={(e) => {
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-expect-error
                          e.target.style.display = "none";
                        }}
                      />
                    </Box>
                  </Link>
                ) : (
                  <Box
                    key={index}
                    mr="space.l"
                    minH={246}
                    minW="100%"
                    boxShadow="xl"
                    rounded="md"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor="gray.200"
                    backgroundColor="gray.200"
                  >
                    <img
                      src={nft.image}
                      alt={nft.name}
                      style={{ width: "100%", height: "100%" }}
                      onError={(e) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        e.target.style.display = "none";
                      }}
                    />
                  </Box>
                )}

                {nft.name ? (
                  <Text mt="space.s" fontWeight="500">
                    {nft.name}
                  </Text>
                ) : (
                  <Text mt="space.s" fontWeight="500">
                    {nft.address && nft.address.slice(0, 6) + "..." + nft.address.slice(-4)}
                  </Text>
                )}
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      <Box pos="fixed" bottom="0" left="0" right="0" bg="white" p="20px" boxShadow="2xl">
        <Button onClick={onClickSendTx} isDisabled={!account} isLoading={isLoading}>
          Send Tx
        </Button>
      </Box>
    </Box>
  );
};

export default ViewTransaction;
