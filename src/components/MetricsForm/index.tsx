import React, { useEffect, useState } from "react";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import { RotateLoader, ClipLoader } from "react-spinners";

import { ArrowRight, Minus, MoveRight, Plus } from "lucide-react";
import { eachRight } from "lodash";
import Input from "../Input";
import InputLabel from "../InputLabel";
import { IMetricsForm, IValidator, maximumPenaltyPercentage, minimumInsuranceFeePercentage, minimumLiquidityPercentage, minimumPenaltyPercentage } from "../CreateForm/indexReal";

export default function MetricsForm({
  metricsForm,
  setMetricsForm,
  validator,
  setValidator,
  validateNumber,
  validatePercentage,
}: {
  metricsForm: IMetricsForm;
  setMetricsForm: React.Dispatch<React.SetStateAction<IMetricsForm>>;
  validator: IValidator | undefined;
  setValidator: React.Dispatch<React.SetStateAction<IValidator | undefined>>;
  validateNumber: (value: string, isValidator: string) => void;
  validatePercentage: (
    value: string,
    min: number,
    max: number,
    isValidator: string
  ) => void;
}) {
  const initialLength =
    metricsForm.durations.length > 0 ? metricsForm.durations.length : 2;
  const [investmentPlanLength, setInvestmentPlanLength] =
    useState(initialLength);

  // const minimumInsuranceFeePercentage = 20;
  // const minimumLiquidityPercentage = 10;
  // const minimumPenaltyPercentage = 10;
  // const maximumPenaltyPercentage = 75;
  const [firstCheck, setFirstCheck] = useState(false);

  // const [isFirstLoaded, setIsFirstLoaded] = useState(true);

  // const anyDataFilled = () => {
  //   return Object.values(metricsForm).some((value) => value);
  // };

  // useEffect(() => {
  //   if (anyDataFilled() && isFirstLoaded) {
  //     const {
  //       minimumAmount,
  //       maximumAmount,
  //       insuranceFeePercentage,
  //       liquidityPercentage,
  //       penaltyPercentage,
  //       durations,
  //       percentages,
  //     } = metricsForm;

  //     if (minimumAmount) {
  //       validateNumber(minimumAmount, "isMinimumAmount");
  //     }
  //     if (maximumAmount) {
  //       validateNumber(maximumAmount, "isMaximumAmount");
  //     }
  //     if (insuranceFeePercentage) {
  //       validatePercentage(
  //         insuranceFeePercentage,
  //         minimumInsuranceFeePercentage,
  //         100,
  //         "isInsuranceFeePercentage"
  //       );
  //     }
  //     if (liquidityPercentage) {
  //       validatePercentage(
  //         liquidityPercentage,
  //         minimumLiquidityPercentage,
  //         100,
  //         "isLiquidityPercentage"
  //       );
  //     }
  //     if (penaltyPercentage) {
  //       validatePercentage(
  //         penaltyPercentage,
  //         minimumPenaltyPercentage,
  //         maximumPenaltyPercentage,
  //         "isPenaltyPercentage"
  //       );
  //     }

  //     setIsFirstLoaded(false);
  //   }
  // }, [metricsForm]);

  // const validateNumber = (value: string, isValidator: string) => {
  //   const positiveNumberPattern = /^\d*\.?\d+$/;
  //   if (!positiveNumberPattern.test(value) || Number(value) == 0) {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: false };
  //     });
  //   } else {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: true };
  //     });
  //   }
  // };

  // const validatePercentage = (
  //   value: string,
  //   min: number,
  //   max: number,
  //   isValidator: string
  // ) => {
  //   const positiveNumberPattern = /^\d*\.?\d+$/;
  //   if (
  //     !positiveNumberPattern.test(value) ||
  //     Number(value) < min ||
  //     Number(value) > max
  //   ) {
  //     setValidator((prevValidator: any) => {
  //       return {
  //         ...prevValidator,
  //         [isValidator]: false,
  //       };
  //     });
  //   } else {
  //     setValidator((prevValidator: any) => {
  //       return {
  //         ...prevValidator,
  //         [isValidator]: true,
  //       };
  //     });
  //   }
  // };

  const increment = () => {
    if (investmentPlanLength >= 10) {
      setInvestmentPlanLength(10);
    } else {
      setInvestmentPlanLength(investmentPlanLength + 1);
    }
  };

  const decrement = () => {
    if (investmentPlanLength <= 2) {
      setInvestmentPlanLength(2);
    } else {
      setInvestmentPlanLength(investmentPlanLength - 1);
      setMetricsForm((prevMetricsForm) => {
        const newPercentages = [...prevMetricsForm.percentages];
        const newDurations = [...prevMetricsForm.durations];

        newPercentages.pop();
        newDurations.pop();

        return {
          ...prevMetricsForm,
          percentages: newPercentages,
          durations: newDurations,
        };
      });
    }
  };

  const array = (arrayLength: number) => {
    const resultArray = Array.from(Array(arrayLength).keys()).map(
      (index) => index
    );

    return resultArray;
  };

  const isAligned = (durations: string[], percentages: string[]) => {
    for (let i = 0; i < durations.length; i++) {
      if (!(durations[i] && percentages[i])) {
        return false;
      }
    }
    return true;
  };

  const isValidValue = (durations: string[], percentages: string[]) => {
    for (let i = 0; i < durations.length; i++) {
      const currentDuration = durations[i];
      const currentPercentage = percentages[i];

      const positiveNumberPattern = /^\d*\.?\d+$/;
      if (
        !positiveNumberPattern.test(currentDuration) ||
        !positiveNumberPattern.test(currentPercentage)
      ) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const durations = metricsForm.durations;
    const percentages = metricsForm.percentages;

    console.log("Durations: ", durations);
    console.log("Percentages: ", percentages);

    console.log("Is Aligned: ", isAligned(durations, percentages));

    if (durations.length != percentages.length) {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, isDurationsAndPercentages: false };
      });
    } else if (!isAligned(durations, percentages)) {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, isDurationsAndPercentages: false };
      });
    } else if (!isValidValue(durations, percentages)) {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, isDurationsAndPercentages: false };
      });
    } else {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, isDurationsAndPercentages: true };
      });
    }
  }, [metricsForm]);

  useEffect(() => {
    if (
      metricsForm &&
      metricsForm.durations.length > 0 &&
      firstCheck == false
    ) {
      setInvestmentPlanLength(metricsForm.durations.length);
      setFirstCheck(true);
    }
  }, [metricsForm]);

  console.log("Validator: ", validator);

  return (
    <>
      <section>
        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Minimum Amount
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Please input the minimum investment amount required from
              investors; any amount below this will be rejected
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Minimum Amount" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  validateNumber(value, "isMinimumAmount");

                  setMetricsForm((prevMetricsForm) => {
                    return {
                      ...prevMetricsForm,
                      minimumAmount: value,
                    };
                  });
                }}
                value={metricsForm.minimumAmount}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {validator?.isMinimumAmount === false && (
                <p className="py-2 text-red-700">
                  Amount should be a positive number
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Maximum Amount
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Please input the maximum investment amount required from
              investors; any amount above this will be rejected
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Maximum Amount" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  validateNumber(value, "isMaximumAmount");

                  setMetricsForm((prevMetricsForm) => {
                    return {
                      ...prevMetricsForm,
                      maximumAmount: value,
                    };
                  });
                }}
                value={metricsForm.maximumAmount}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {validator?.isMaximumAmount === false && (
                <p className="py-2 text-red-700">
                  Amount should be a positive number
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Insurance Fee Percentage
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This specifies the fee an investor has to pay when creating an
              investment.
              <br />
              <br />
              Input should be a number within {minimumInsuranceFeePercentage} to
              100.{" "}
            </p>

            <p className="text-base leading-7">
              <br />
              For example, 50%
              <br />
              The example illustrates that when an investor intends to create an
              investment with, let's say, 1000 TOKEN, the platform will perform
              a conversion of these 1000 TOKEN into USD. In this example,
              suppose that 1000 TOKEN is equivalent to $1000. Consequently, the
              user is required to make a payment equal to 50% of $1000, which
              amounts to $500 as an insurance fee. This fee will be collected
              from the user in USDT.
            </p>
          </div>
          <div className="md:w-7/12 md:px-11 mt-4 md:mt-0">
            <div>
              <InputLabel title="Insurance Fee Percentage" />
              <div className="flex space-x-3 items-center">
                <Input
                  onChange={(event) => {
                    const { value } = event.target;

                    validatePercentage(
                      value,
                      minimumInsuranceFeePercentage,
                      0,
                      "isInsuranceFeePercentage"
                    );

                    setMetricsForm((prevMetricsForm) => {
                      return {
                        ...prevMetricsForm,
                        insuranceFeePercentage: value,
                      };
                    });
                  }}
                  value={metricsForm.insuranceFeePercentage}
                  type="text"
                  placeholder={""}
                  inputClassName="spin-button-hidden text-xl text-gray-800"
                />
                <p className="text-2xl font-bold">%</p>
              </div>
              {validator?.isInsuranceFeePercentage === false && (
                <p className="py-2 text-red-700">
                  Percentage should be within {minimumInsuranceFeePercentage} to
                  100
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Liquidity Percentage
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This indicates the portion of the insurance fee that will be
              distributed among all liquidity providers for your token.
              <br />
              <br />
              Input should be a number within {minimumLiquidityPercentage} to
              100
            </p>

            <p className="text-base leading-7">
              <br />
              For example, 30% <br />
              This example demonstrates that when a user pays an insurance fee
              of 500 USDT, 30% of this amount, which equals 150 USDT, will be
              distributed among all liquidity providers based on the amount of
              liquidity they contributed
            </p>
          </div>
          <div className="md:w-7/12 md:px-11 mt-4 md:mt-0">
            <div>
              <InputLabel title="Liquidity Percentage" />
              <div className="flex space-x-3 items-center">
                <Input
                  onChange={(event) => {
                    const { value } = event.target;

                    validatePercentage(
                      value,
                      minimumLiquidityPercentage,
                      100,
                      "isLiquidityPercentage"
                    );

                    setMetricsForm((prevMetricsForm) => {
                      return {
                        ...prevMetricsForm,
                        liquidityPercentage: value,
                      };
                    });
                  }}
                  value={metricsForm.liquidityPercentage}
                  type="text"
                  placeholder={""}
                  inputClassName="spin-button-hidden text-xl text-gray-800"
                />
                <p className="text-2xl font-bold">%</p>
              </div>
              {validator?.isLiquidityPercentage === false && (
                <p className="py-2 text-red-700">
                  Percentage should be within {minimumLiquidityPercentage} to
                  100
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Penalty Percentage
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This represents the fraction of the investor's initial investment
              that will be directed to the treasury if the investor decides to
              terminate the investment prematurely, prior to the duration
              initially specified by the investor.
              <br />
              <br />
              Input should be a number within 10 to 100
            </p>

            <p className="text-base leading-7">
              <br />
              For example, 50%
              <br />
              This example demonstrates that when an investor commits 1000 TOKEN
              to an investment lasting one year, and subsequently opts to
              terminate the investment prior to the full year's duration, 50% of
              the initial investment, specifically 50% of the 1000 TOKEN amount,
              totaling 500 TOKEN, will be directed to the previously mentioned
              treasury. The remaining 500 TOKEN will be returned to the
              investor.
            </p>
          </div>
          <div className="md:w-7/12 md:px-11 mt-4 md:mt-0">
            <div>
              <InputLabel title="Penalty Percentage" />
              <div className="flex space-x-3 items-center">
                <Input
                  onChange={(event) => {
                    const { value } = event.target;

                    validatePercentage(
                      value,
                      minimumPenaltyPercentage,
                      maximumPenaltyPercentage,
                      "isPenaltyPercentage"
                    );

                    setMetricsForm((prevMetricsForm) => {
                      return {
                        ...prevMetricsForm,
                        penaltyPercentage: value,
                      };
                    });
                  }}
                  value={metricsForm.penaltyPercentage}
                  type="text"
                  placeholder={""}
                  inputClassName="spin-button-hidden text-xl text-gray-800"
                />
                <p className="text-2xl font-bold">%</p>
              </div>
              {validator?.isPenaltyPercentage === false && (
                <p className="py-2 text-red-700">
                  Percentage should be within {minimumPenaltyPercentage} to
                  {maximumPenaltyPercentage}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col border-t my-11 border-gray-300 py-11 md:px-16 px-5">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Duration and Percentage
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Set duration with the corresponding percentage. For example 30
              days for 40%
            </p>
          </div>
          <div className="md:w-7/12 md:px-11 mt-4 md:mt-0">
            <div className="">
              <div className="flex justify-between">
                <InputLabel title="Days and Reward" />
                <div className="flex space-x-5 items-center text-md ">
                  <button
                    onClick={decrement}
                    className="bg-gray-200 p-2 px-5 rounded-md"
                  >
                    <div className="flex space-x-2">
                      <p>Remove</p>
                      <Minus className="inline" />
                    </div>
                  </button>
                  <button
                    onClick={increment}
                    className="bg-gray-200 p-2 px-5 rounded-md"
                  >
                    <div className="flex space-x-2">
                      <p>Add</p>
                      <Plus className="inline" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-5 my-2">
                {array(investmentPlanLength).map((current, index) => {
                  return (
                    <div className="flex space-x-10 items-center">
                      <div className="flex space-x-2 items-center">
                        <Input
                          onChange={(event) => {
                            const { value } = event.target;
                            // const isValid = isValidDurationsAndRewards();
                            setMetricsForm((prevMetricsForm) => {
                              const newDurations = [
                                ...prevMetricsForm.durations,
                              ];

                              newDurations[index] = value;
                              return {
                                ...prevMetricsForm,
                                durations: newDurations,
                              };
                            });
                          }}
                          type="text"
                          value={metricsForm.durations[index]}
                          placeholder={""}
                          inputClassName="spin-button-hidden text-xl text-gray-800"
                        />
                        <p className="text-xl">days</p>
                      </div>

                      <div className="flex space-x-2 items-center">
                        <Input
                          onChange={(event) => {
                            const { value } = event.target;

                            setMetricsForm((prevMetricsForm) => {
                              const newPercentages = [
                                ...prevMetricsForm.percentages,
                              ];

                              newPercentages[index] = value;
                              return {
                                ...prevMetricsForm,
                                percentages: newPercentages,
                              };
                            });
                          }}
                          value={metricsForm.percentages[index]}
                          type="text"
                          placeholder={""}
                          inputClassName="spin-button-hidden text-xl text-gray-800"
                        />
                        <p className="text-2xl">%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {validator?.isDurationsAndPercentages === false && (
                <p className="py-2 text-red-700">
                  Durations should have their corresponding rewards and fields
                  should be a number
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center text-center sm:block sm:p-0 mt-2"></div>
    </>
  );
}
