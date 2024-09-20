import { Duration } from "../../types/general";

interface IFlexvisReward {
  durationOptions: Duration[];
}
export default function FlexvisReward({ durationOptions }: IFlexvisReward) {
  return (
    <div className="mt-1 rounded-2xl border border-dashed border-gray-500 p-2">
      <h3 className="mt-1 mb-1 text-center text-base font-medium uppercase ">
        Rewards
      </h3>

      {durationOptions?.map((eachDuration: Duration, index) => {
        return (
          <div className="flex items-center justify-center space-x-2 space-y-2 px-5">
            <p className="leading-8">
              {eachDuration.percentage}% reward if you{" "}
              {eachDuration.name.toLowerCase()}{" "}
            </p>
          </div>
        );
      })}
    </div>
  );
}
