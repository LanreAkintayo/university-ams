import { selectTheme, getTheme } from "../stores/themeSlice";
import { selectPageLoader, setPageLoader } from "../stores/pageLoaderSlice";
import { updateAllProjects } from "../stores/projectSlice";
import { useAppDispatch, useAppSelector } from "../stores/hooks";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { Transition } from "@headlessui/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/store";
import {
  loadBalance,
  loadChainId,
  loadSignerAddress,
} from "../stores/walletSlice";
import { useAccount, useDisconnect } from "wagmi";
import { watchNetwork, watchAccount } from "@wagmi/core";
import {
  loadAllProjects,
  loadDisapprovedProjects,
  loadPendingProjects,
  loadProtocolDetails,
} from "../stores/insuranceSlice";

function Main() {
  const theme = useAppSelector(selectTheme);
  const pageLoader = useAppSelector(selectPageLoader);
  const Component = getTheme(theme).component;
  const dispatch = useAppDispatch();

  const wallet = useSelector((state: RootState) => state.wallet);
  const { signerAddress, balance, chainId } = wallet;

  const { isConnected } = useAccount();

  /*** -------------------------------------------- */
  //      GET ACTIVE NETWORK ID
  /*** -------------------------------------------- */
  useEffect(() => {
    async function getChainId() {
      try {
        dispatch(loadChainId());
        dispatch(loadSignerAddress());
      } catch (err) {
        console.log("Error::", err);
      }
    }

    getChainId();
  }, [isConnected]);

  /*** -------------------------------------------- */
  //      GET BLOCKCHAIN DATA
  /*** -------------------------------------------- */
  useEffect(() => {
    const calclateInitialSettings = async () => {
      try {
        watchAccount(async (account) => {
          console.log("Account has changed......", account);
          const newAccountAddress = account && account.address;
          try {
            dispatch(loadSignerAddress());

            if (newAccountAddress) {
              dispatch(loadBalance(newAccountAddress));
            }
          } catch (err) {
            console.log("No account is detected");
          }
        });

        watchNetwork(async (network) => {
          console.log("Network has changed:.......... ", network);

          console.log("Printing dispatch input:: ", dispatch(loadChainId()))
        });
      } catch (err) {
        console.log("Error::: ", err);
      }
    };
    calclateInitialSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateBalance = async () => {
      try {
        if (signerAddress && chainId) {
          console.log(
            "We are inside the dashboard trying to loadProtocolDetails"
          );
          dispatch(loadBalance(signerAddress as `0x${string}`));
        }
      } catch (err) {
        console.log("Error");
      }
    };

    updateBalance();
  }, [signerAddress, chainId]);

  useEffect(() => {
    const updateData = async () => {
      try {
        console.log("Printing loadAllProjects dispatch: ", dispatch(loadAllProjects()));
        dispatch(loadPendingProjects());
        dispatch(loadDisapprovedProjects());
        dispatch(loadProtocolDetails());
      } catch (err) {
        console.log("Error");
      }
    };

    updateData();
  }, []);

  return (
    <div>
      <Transition
        show={!pageLoader}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Component />
      </Transition>
      <Transition
        show={pageLoader}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <svg
          className="fixed inset-0 w-10 h-10 m-auto text-theme-1 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </Transition>
      <ThemeSwitcher />
    </div>
  );
}

export default Main;
