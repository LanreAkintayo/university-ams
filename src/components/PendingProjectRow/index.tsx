import { ethers } from "ethers";
import moment from "moment";
import { useState } from "react";
import { IRobustPending } from "../PendingProject";
import { formatAddress } from "../../utils/helper";
import ViewModal from "../ModalView";

export default function PendingProjectRow({
  pendingProject,
}: {
  pendingProject: IRobustPending;
}) {
  const [openViewModal, setOpenViewModal] = useState(false);

  return (
    <>
      <tr>
        <td className="whitespace-nowrap pr-4 py-4">
          {formatAddress(pendingProject.tokenAddress)}
        </td>

        <td className="whitespace-nowrap px-4 py-4">
          {formatAddress(pendingProject.creator)}
        </td>
        <td className="whitespace-nowrap px-4 py-4"></td>

        <td className="whitespace-nowrap px-4 py-4">
          <button
            className="rounded-md border bg-theme-1 text-white p-2"
            onClick={() => setOpenViewModal(true)}
          >
            View Details
          </button>
        </td>
      </tr>

      {openViewModal && (
        <div className="mt-2 flex justify-center text-center scrollbar-hide sm:block sm:p-0">
          <ViewModal
            openViewModal={openViewModal}
            setOpenViewModal={setOpenViewModal}
            pendingProject={pendingProject}
          />
        </div>
      )}
    </>
  );
}
