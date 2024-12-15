import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Custom theme
const theme = extendTheme({
  colors: {
    brand: {
      100: "#f7fafc",
      900: "#1a202c",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
