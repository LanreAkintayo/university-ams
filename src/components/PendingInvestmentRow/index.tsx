
import { ethers } from "ethers";
import moment from "moment";
import { useState } from "react";
import { formatAddress, inDollarFormat } from "../../utils/helper";
import { FormattedPendingInvestment } from "../../types/general";
import ModalApprove from "../ModalApprove";
import ModalDisapprove from "../ModalDisapprove";

function Main({
  pendingInvestment,
}: {
  pendingInvestment: FormattedPendingInvestment;
}) {
  const timeCreated = moment(
    Number(BigInt(pendingInvestment.startDay) * 1000n),
    "x"
  ).format("lll");

  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openDisapproveModal, setOpenDisapproveModal] = useState(false);

  const handleApprove = async () => {
    alert("Approving Investment");
  };

  const handleDisapprove = async () => {
    alert("Disapproving investment: ");
  };

  return (
    <>
      <tr>
        <td className="whitespace-nowrap pr-4 py-4">
          {formatAddress(pendingInvestment.investmentId)}
        </td>
        <td className="whitespace-nowrap px-4 py-4">
          {inDollarFormat(
            Number(
              ethers.formatUnits(
                pendingInvestment.investedAmount,
                pendingInvestment.tokenAttributes.decimals
              )
            )
          )}{" "}
          {pendingInvestment.tokenAttributes.symbol}
        </td>
        <td className="whitespace-nowrap px-4 py-4">
          {inDollarFormat(
            Number(
              ethers.formatUnits(
                pendingInvestment.insuranceFee,
                pendingInvestment.stableAttributes.decimals
              )
            )
          )}{" "}
          {pendingInvestment.stableAttributes.symbol}
        </td>
        <td className="whitespace-nowrap px-4 py-4">{timeCreated}</td>
        <td className="whitespace-nowrap px-4 py-4">
          <button
            className="rounded-md bg-theme-1 p-2 text-white"
            onClick={() => setOpenApproveModal(true)}
          >
            Approve
          </button>
        </td>
        <td className="whitespace-nowrap px-4 py-4">
          <button
            className="rounded-md p-2 bg-theme-1 text-white"
            onClick={() => setOpenDisapproveModal(true)}
          >
            Disapprove
          </button>
        </td>
      </tr>

      {openApproveModal && pendingInvestment && (
        <div className="mt-2 flex justify-center text-center scrollbar-hide sm:block sm:p-0">
          <ModalApprove
            setOpenApproveModal={setOpenApproveModal}
            pendingInvestment={pendingInvestment}
          />
        </div>
      )}
      {openDisapproveModal && pendingInvestment && (
        <div className="mt-2 flex justify-center text-center scrollbar-hide sm:block sm:p-0">
          <ModalDisapprove
            setOpenDisapproveModal={setOpenDisapproveModal}
            pendingInvestment={pendingInvestment}
          />
        </div>
      )}
    </>
  );
}


export default Main;