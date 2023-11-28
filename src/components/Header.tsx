import { Box, Menu, MenuList, MenuItem, MenuButton, IconButton } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { HamburgerIcon } from "@chakra-ui/icons";

const HamburgerMenu: React.FC = () => {
  return (
    <Menu>
      {({ isOpen }) => (
        <>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant="outline"
            colorScheme="whiteAlpha"
          />
          <MenuList>
            <MenuItem as={Link} to="/build-link">
              Build Link
            </MenuItem>
            <MenuItem as={Link} to="/view">
              View
            </MenuItem>
          </MenuList>
        </>
      )}
    </Menu>
  );
};

export default function Header() {
  return (
    <Box as="header" bg="teal.500" p={4} color="white" w="100%">
      <HamburgerMenu />
    </Box>
  );
}
