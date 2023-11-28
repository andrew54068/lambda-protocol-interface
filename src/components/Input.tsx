import { Input as ChakraInput, InputRightElement, InputGroup, InputProps } from "@chakra-ui/react";

interface Props {
  rightElement?: React.ReactNode;
}

export default function Input({ rightElement, ...props }: Props & InputProps) {
  return rightElement ? (
    <InputGroup alignItems="center">
      <ChakraInput px="space.m" py="space.m" h="54px" {...props} />
      <InputRightElement h="54px" w="auto" right="space.m">
        {rightElement}
      </InputRightElement>
    </InputGroup>
  ) : (
    <ChakraInput p="space.m" py="space.s" h="54px" {...props} />
  );
}
