import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

import { BrowserRouter } from "react-router-dom";

import App from "./App";

// Importe o ThirdWeb
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';

// Inclua que redes você quer dar suporte.
// 4 = Rinkeby.
const activeChainId = ChainId.Rinkeby;

// Por último, envolva o App com o thirdweb provider.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThirdwebProvider desiredChainId={activeChainId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>
);


