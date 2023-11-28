import { Route, Routes, useLocation } from "react-router-dom";
import theme from "./theme";
import { useEffect } from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import "./App.css";
import Navbar from "./components/Navbar";
import BuildLink from "./components/BuildLink";
import NotFound from "./components/NotFound";
import { GlobalProvider } from "./context/globalContextProvider";
import { logPageView } from "src/services/Amplitude";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    logPageView(pathname);
  }, [pathname]);

  return (
    <GlobalProvider>
      <ChakraProvider theme={theme}>
        <Box margin="0 auto" width="100%">
          <Navbar />
          <Box margin="0 auto" maxW="560px" minH="100vh">
            <Routes>
              <Route path="/build-link" element={<BuildLink />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Box>
      </ChakraProvider>
    </GlobalProvider>
  );
}

export default App;
