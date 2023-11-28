import { Box, Flex, FlexProps, Text, keyframes } from "@chakra-ui/react";
import { ReactNode } from "react";

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
`;

const Dot = ({ delayMultiplier = 0 }: { delayMultiplier?: number }) => {
  const animation = `${bounce} 1.4s infinite ${delayMultiplier * 0.16}s ease-in-out both`;

  return (
    <Box
      width="10px"
      height="10px"
      borderRadius="50%"
      bg="background.primary"
      mr="space.xs"
      _last={{ mr: "0" }}
      animation={animation}
    />
  );
};

const fadeOut = keyframes`
  0%, 80%, 100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
`;

const DotInText = ({ delayMultiplier = 0 }: { delayMultiplier?: number }) => {
  const animation = `${fadeOut} 1.4s infinite ${delayMultiplier * 0.16}s ease-in-out`;

  return (
    <Text as="span" animation={animation}>
      .
    </Text>
  );
};

const LinearSpinner = ({
  type = "dot",
  content,
  ...rest
}: {
  type?: "dot" | "text";
  content?: ReactNode;
} & FlexProps) => {
  let Comp = Dot;
  if (type === "text") Comp = DotInText;
  return (
    <Flex as={type === "text" ? "span" : undefined} justifyContent="center" alignItems="center" {...rest}>
      {type === "text" && content}
      {Array.from({ length: 3 }).map((_, i) => (
        <Comp key={i} delayMultiplier={i} />
      ))}
    </Flex>
  );
};

export default LinearSpinner;
