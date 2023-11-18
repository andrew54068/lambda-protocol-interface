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
import { hex2a } from "./BuildLink";

const App: React.FC = () => {
  // const [txHashes, setTxHashes] = useState<string[]>([""]);
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");

  const toast = useToast();
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const offchainAttestationId = "0xfff11dfa5c6bf852db5ab022c63c01ca2ae4da698878e1adb9f461ebc4bc6c3b";
  const html = `https://sepolia.easscan.org/offchain/attestation/view/${offchainAttestationId}`;

  const executeLambda = async () => {
    setLoading(true);

    const url = "http://0.0.0.0:9999/lambda/multiply_js";
    const inputJsonStr = JSON.stringify({ a: input1, b: input2 }); // {"addr":"0x...."}
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

    const final = hex2a(output.data.output);

    console.log(`💥 response: ${JSON.stringify(final, null, "  ")}`);
    // alert(result);
    setResult(final);
    setLoading(false);
  };

  return (
    <HStack gap="200px" margin="0" alignItems="center" justifyContent="center">
      <VStack gap="0" alignItems="flex-start" margin="0" mt="75px" pt="space.3xl" px="20px">
        <Text fontWeight="weight.l" fontSize="size.heading.3" mb="space.m">
          Use a verified lambda
        </Text>
        <Text fontSize="lg" mb="space.m">
          Calculate
        </Text>
        <Flex alignItems="center" w="100%" mb="space.xs">
          <Input
            value={input1}
            onChange={(event) => setInput1(event.target.value)}
            placeholder="Enter first input here"
          />
        </Flex>
        <Flex alignItems="center" w="100%" mb="space.xs">
          <Input
            value={input2}
            onChange={(event) => setInput2(event.target.value)}
            placeholder="Enter second input here"
          />
        </Flex>
        <Flex alignItems="center" w="100%" mb="space.xs">
          <Input
            placeholder="Your result will be shown here"
            isReadOnly
            value={result ?? "Your result will be shown here"}
          />
        </Flex>
        <Button onClick={executeLambda}>Multiply</Button>
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
