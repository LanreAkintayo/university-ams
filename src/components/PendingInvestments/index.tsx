import { FormattedPendingInvestment } from "../../types/general";
import PendingInvestmentRow from "../PendingInvestmentRow";

interface IPendingInvestments {
  projectPendingInvestments: FormattedPendingInvestment[];
}
export default function PendingInvestments({
  projectPendingInvestments,
}: IPendingInvestments) {
  return (
    <div>
      <table className="divide-y divide-slate-400">
        <thead>
          <tr>
            <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Investment ID
            </th>
            <th className=" px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Invested Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Insurance Fee
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Time Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 ">
          {projectPendingInvestments.length > 0 ? (
            projectPendingInvestments.map((pendingInvestment, id) => {
              return (
                <PendingInvestmentRow key={id} pendingInvestment={pendingInvestment} />
              );
            })
          ) : (
            <td colSpan={4} className="py-3">
              No pending Investments
            </td>
          )}
        </tbody>
      </table>
    </div>
  );
}
