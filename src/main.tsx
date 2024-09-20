import ScrollToTop from "./base-components/ScrollToTop";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./stores/store";
import Router from "./router";
import "./assets/css/app.css";


import { ToastContainer } from "react-toastify";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Provider store={store}>
        <Router />
      <ToastContainer />
    </Provider>
    <ScrollToTop />
  </BrowserRouter>
);



// import ScrollToTop from "./base-components/ScrollToTop";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { Provider } from "react-redux";
// import { store } from "./stores/store";
// import Router from "./router";
// import "./assets/css/app.css";
// import {
//   EthereumClient,
//   w3mConnectors,
//   w3mProvider,
// } from "@web3modal/ethereum";
// import { Web3Modal } from "@web3modal/react";
// import { configureChains, createConfig, WagmiConfig } from "wagmi";
// import { bsc, bscTestnet } from "wagmi/chains";
// import { ToastContainer } from "react-toastify";

// // 1. Get projectID at https://cloud.walletconnect.com
// if (!import.meta.env.VITE_PUBLIC_PROJECT_ID) {
//   throw new Error("You need to provide VITE_PUBLIC_PROJECT_ID env variable");
// }
// const projectId = import.meta.env.VITE_PUBLIC_PROJECT_ID;

// // 2. Configure wagmi client
// const chains = [bsc, bscTestnet];

// const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: w3mConnectors({ chains, projectId }),
//   publicClient,
// });

// // 3. Configure modal ethereum client
// const ethereumClient = new EthereumClient(wagmiConfig, chains);

// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
//   <BrowserRouter>
//     <Provider store={store}>
//       <WagmiConfig config={wagmiConfig}>
//         <Router />
//       </WagmiConfig>

//       <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
//       <ToastContainer />
//     </Provider>
//     <ScrollToTop />
//   </BrowserRouter>
// );
