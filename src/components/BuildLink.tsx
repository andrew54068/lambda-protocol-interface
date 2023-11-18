import { Fragment, useState, useEffect } from "react";
import Button from "./Button";
import getTxInfo from "src/utils/getTxInfo";
import getABI from "src/utils/getABI";
import strip0x from "src/utils/strip0x";
import { ADDR_PLACEHOLDER } from "src/constants";
import getMethodData from "src/utils/getMethodData";
import MinusIcon from "src/assets/minus.svg?react";
import Input from "./Input";
import {
  useToast,
  Button as ChakraButton,
  Flex,
  Tag,
  VStack,
  HStack,
  Box,
  Text,
  Card,
  Image,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Loading from "src/components/Loading";
import {
  logClickCopyLink,
  logClickGenerateLink,
  logClickAddButton,
  logEnterTransactionHash,
  logViewBuildPage,
  logClickPostToTwitter,
} from "src/services/Amplitude";
import { useEthereum } from "src/services/evm";

const generateReadableCallData = (methodData: any) => {
  return methodData.name;
};

export const hex2a = (hex) => {
  var str = "";
  for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
};

const App: React.FC = () => {
  const [txHashes, setTxHashes] = useState<string[]>([""]);
  const { account, connect, disconnect } = useEthereum();

  const toast = useToast();
  const [txLink, setTxLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [readyForSharing, setReadyForSharing] = useState<boolean>(false);
  const [txDataWithMethodInfo, setTxDataWithMethodInfo] = useState<
    {
      to: string;
      data: string;
      value: number;
      methodData: any;
      readableCallData: string;
    }[]
  >([]);

  useEffect(() => {
    logViewBuildPage();
  }, []);

  const onClickGenerate = async () => {
    setLoading(true);

    const url = "http://0.0.0.0:9999/lambda/batch_mint_v3_js";
    const inputJsonStr = JSON.stringify({ addr: account }); // {"addr":"0x...."}
    console.log(`💥 inputJsonStr: ${JSON.stringify(inputJsonStr, null, "  ")}`);
    const inputJsonStrHex = Buffer.from(inputJsonStr).toString("hex");
    console.log(`💥 inputJsonStrHex: ${JSON.stringify(inputJsonStrHex, null, "  ")}`);
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        input: inputJsonStrHex,
      }), // body data type must match "Content-Type" header
    });

    const output = await response.json();

    const result = hex2a(output.data.output);

    console.log(`💥 response: ${JSON.stringify(result, null, "  ")}`);

    const link = "https://cart-social-share.netlify.app/view?txInfo=" + encodeURIComponent(result);
    console.log(`💥 link: ${JSON.stringify(link, null, '  ')}`);

    setTxLink(link);
    setLoading(false);
  };

  const handleCopy = () => {
    const shareUrl = window.location.origin + "/view?txInfo=" + JSON.stringify(txDataWithMethodInfo);
    navigator.clipboard.writeText(shareUrl);
    toast({
      description: "Your link has been copied to clipboard.",
      status: "success",
      duration: 3000,
      position: "top",
    });
    logClickCopyLink();
  };

  function shareToTwitter(text: string, url: string) {
    const encodedText = encodeURIComponent(text);
    const encodedURL = encodeURIComponent(url);

    const twitterURL = `https://twitter.com/intent/tweet?
      text=${encodedText}&url=${encodedURL}`;

    window.open(twitterURL, "_blank");
  }

  const offchainAttestationId = "0x23099b586ec8eb6056dc00c233336c2dda17994ee8d7fec5f5fc673c231cc242";
  const html = `https://sepolia.easscan.org/offchain/attestation/view/${offchainAttestationId}`;

  return (
    <HStack gap="200px" margin="0" alignItems="center" justifyContent="center">
      <VStack gap="0" alignItems="flex-start" w="500px" margin="0" mt="75px" pt="space.3xl" px="20px">
        <Text fontWeight="weight.l" fontSize="size.heading.3" mb="space.m">
          Use a verified lambda
        </Text>
        <Text fontSize="lg" mb="space.m">
          Mint multiple NFT to
        </Text>
        <Flex alignItems="center" w="100%" mb="space.xs">
          <Input value={account ?? "connect wallet first"} placeholder="Enter transaction hash here" />
        </Flex>
        <Card p="20px" w="100%" left="0" right="0">
          <Text fontSize="size.body.2" mb="20px">
            Your Link For Sharing
          </Text>

          <Box mb="20px">
            <Input
              placeholder="Your link will be shown here"
              isReadOnly
              value={txLink ?? "Your link will be shown here"}
            />
          </Box>
          {loading && (
            <Flex
              pos="absolute"
              top="0"
              right="0"
              bottom="0"
              left="0"
              bg="rgba(255,255,255,0.5)"
              alignItems="center"
              justifyContent="center"
              zIndex={1}
            >
              <Loading />
            </Flex>
          )}
          {readyForSharing ? (
            <>
              <Button mb="space.m" onClick={handleCopy}>
                {" "}
                Copy{" "}
              </Button>
              <Button
                colorScheme="twitter"
                variant="secondary"
                onClick={() => {
                  shareToTwitter("Share the link", txLink);
                  logClickPostToTwitter();
                }}
              >
                Post on Twitter
              </Button>
            </>
          ) : (
            <Button onClick={onClickGenerate} isDisabled={!account}>
              Generate Link
            </Button>
          )}
        </Card>
      </VStack>
      <VStack gap="20px" alignItems="center" margin="0" mt="75px" pt="space.3xl" px="20px">
        <Image
          src="https://pbs.twimg.com/profile_images/1593335725751083008/0XMyDyLq_400x400.png"
          alt="EAS"
          maxWidth="200px"
        />
        <Link href={html} isExternal>
          Offchain Attestation <ExternalLinkIcon mx="2px" />
        </Link>
        {/* <Text fontWeight="weight.l" fontSize="size.heading.3" mb="space.m">
          EAS
        </Text> */}
      </VStack>
    </HStack>
  );
};

export default App;
