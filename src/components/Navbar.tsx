import { HamburgerIcon } from "@chakra-ui/icons";
import { Box, ListItem as ChakraListItem, Collapse, Flex, IconButton, List } from "@chakra-ui/react";
import Button from "src/components/Button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useClickAway from "src/hooks/useClickAway";
import { useEthereum } from "src/services/evm";
import formatAddress from "src/utils/formatAddress";
import { logClickMenu, logClickConnectWallet, logClickBuildYourLink } from "src/services/Amplitude";

const ListItem = ({ children, ...rest }: any) => (
  <ChakraListItem
    d="flex"
    alignItems="center"
    px={4}
    py="14px"
    cursor="pointer"
    transition=".2s all"
    _hover={{ bg: "#f8f8f8" }}
    {...rest}
  >
    <Box mx={2} width="100%">
      {children}
    </Box>
  </ChakraListItem>
);

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { account, connect, disconnect } = useEthereum();

  const ref = useClickAway(() => setShowDropdown(false));
  const toggleDropdown = () => {
    logClickMenu();
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {}, [showDropdown]);

  const onClickCopyAccount = () => {
    navigator.clipboard.writeText(account || "");
  };
  const onClickConnect = () => {
    account ? undefined : connect();
    logClickConnectWallet();
  };

  return (
    <Flex
      ref={ref}
      top="0"
      h="75px"
      p="space.s"
      zIndex="banner"
      position="fixed"
      width="100%"
      bg="white"
      boxShadow="0 0 10px 0 rgba(0, 0, 0, 0.05)"
    >
      <Flex justify="space-between" alignItems="center" width="100%">
        <Box fontSize="size.heading.4" fontWeight="weight.l">
          <Link to="/build-link">Build Transaction Link</Link>
        </Box>
        <IconButton onClick={toggleDropdown} aria-label="menu-button" icon={<HamburgerIcon />} variant="outline" />
      </Flex>
      {/* Dropdown menu on mobile */}
      <Collapse
        in={showDropdown}
        style={{
          position: "absolute",
          top: "75px",
          left: 0,
          width: "100%",
          zIndex: 1400,
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          bg="white"
          py="space.s"
          zIndex="overlay"
          onClick={() => setShowDropdown(false)}
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.05)"
        >
          <List bgColor="white" fontWeight={500}>
            <Link to="/build-link">
              <ListItem>
                <Flex alignItems="center" onClick={() => logClickBuildYourLink()}>
                  <Box as="span" ml="space.s">
                    Build Your Link
                  </Box>
                </Flex>
              </ListItem>
            </Link>

            <ListItem onClick={onClickConnect}>
              <Flex alignItems="center" justify="space-between">
                <Box as="span" ml="space.s">
                  {account ? `${formatAddress(account)} ` : "Connect Wallet"}
                </Box>
                {account && (
                  <Button onClick={onClickCopyAccount} w="auto" variant="outline">
                    Copy Address
                  </Button>
                )}
              </Flex>
            </ListItem>

            {account && (
              <ListItem onClick={disconnect}>
                <Flex alignItems="center">
                  <Box as="span" ml="space.s">
                    Disconnect
                  </Box>
                </Flex>
              </ListItem>
            )}
          </List>
        </Box>
      </Collapse>
    </Flex>
  );
}
