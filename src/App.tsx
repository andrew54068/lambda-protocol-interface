import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import theme from "./theme";
import { useEffect } from "react";
import { ChakraProvider, Box, Button, Link, Flex } from "@chakra-ui/react";
import "./App.css";
import Navbar from "./components/Navbar";
import BuildLink from "./components/BuildLink";
import Calculate from "./components/Calculate";

import NotFound from "./components/NotFound";
import { GlobalProvider } from "./context/globalContextProvider";
import { logPageView } from "src/services/Amplitude";

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logPageView(pathname);
  }, [pathname]);

  return (
    <GlobalProvider>
      <ChakraProvider theme={theme}>
        <Box margin="0 auto" width="100%">
          <Navbar />
          <Flex alignItems="center" justifyContent="center" gap="20px">
            <Button onClick={() => navigate("/calculate")} margin="100px 0 0 0">
              Calculate
            </Button>
            <Button onClick={() => navigate("/mint")} margin="100px 0 0 0">
              Mint Multiple NFT
            </Button>
          </Flex>
          <Box margin="0" minH="100vh">
            <Routes>
              <Route path="/calculate" element={<Calculate />} />
              <Route path="/mint" element={<BuildLink />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Box>
      </ChakraProvider>
    </GlobalProvider>
  );
}

export default App;
