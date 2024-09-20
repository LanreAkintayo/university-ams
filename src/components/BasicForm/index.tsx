import React, { useEffect, useRef, useState } from "react";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import { RotateLoader, ClipLoader } from "react-spinners";
import Input from "../Input";
import InputLabel from "../InputLabel";
import { ArrowRight, MoveRight, Trash, Upload } from "lucide-react";
import { eachRight } from "lodash";
import { IBasicForm, IValidator } from "../CreateForm/indexReal";
import Moralis from "moralis/.";
import ImageUploading, { ImageListType } from "react-images-uploading";
import LoadingIcon from "../../base-components/LoadingIcon";

const getImageHash = async (selectedImage: File) => {
  try {
    const formData = new FormData();
    formData.append("file", selectedImage);

    const metadata = JSON.stringify({
      name: "File name",
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
      body: formData,
    });
    const resData = await res.json();
    return resData.IpfsHash;
  } catch (error) {
    console.log(error);
  }
};

export default function BasicForm({
  basicForm,
  setBasicForm,
  validator,
  setValidator,
  validateAddress,
  validateNonEmpty,
  validateDecimal,
}: {
  basicForm: IBasicForm;
  setBasicForm: React.Dispatch<React.SetStateAction<IBasicForm>>;
  validator: IValidator | undefined;
  setValidator: React.Dispatch<React.SetStateAction<IValidator | undefined>>;
  validateAddress: (value: string, isValidator: any) => void;
  validateNonEmpty: (value: string, isValidator: any) => void;
  validateDecimal: (value: string, isValidator: any) => void;
}) {
  const [images, setImages] = React.useState([]);
  const maxNumber = 1;
  const maxFileSize = 5242880; // 5mb
  const resolutionWidth = 500;
  const resolutionHeight = 500;
  const resolutionType = "less";
  const acceptType = ["svg", "jpg", "png"];
  const [isImageChanged, setImageChanged] = useState(false);
  const [isImageProcessing, setImageProcessing] = useState(false);

  const onChange = async (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    setImageProcessing(true);
    const selectedImage = imageList[0].file as File;

    const imageHash = await getImageHash(selectedImage);
    const imageDataUrl = `${
      import.meta.env.VITE_PINATA_GATEWAY_URL
    }/ipfs/${imageHash}`;

    setImages(imageList as never[]);
    setBasicForm((prevBasicForm) => {
      return {
        ...prevBasicForm,
        imageDataUrl: imageDataUrl || "",
      };
    });

    setImageProcessing(false);
  };

  const validWidth: number = 500;
  const validHeight: number = 500;
  const totalNumberOfCharacters = 300;
  // const [isFirstCheck, setIsFirstCheck] = useState(true);

  // const anyDataFilled = () => {
  //   return Object.values(basicForm).some((value) => value);
  // };

  // useEffect(() => {
  //   if (anyDataFilled() && isFirstCheck) {
  //     const {
  //       tokenAddress,
  //       treasuryAddress,
  //       tokenName,
  //       tokenSymbol,
  //       tokenDecimal,
  //       description,
  //     } = basicForm;

  //     if (tokenAddress) {
  //       validateAddress(tokenAddress, "isTokenAddress");
  //     }
  //     if (treasuryAddress) {
  //       validateAddress(treasuryAddress, "isTreasuryAddress");
  //     }
  //     if (tokenName) {
  //       validateNonEmpty(tokenName, "isTokenName");
  //     }
  //     if (tokenSymbol) {
  //       validateNonEmpty(tokenSymbol, "isTokenSymbol");
  //     }
  //     if (tokenDecimal) {
  //       validateDecimal(tokenDecimal, "isTokenDecimal");
  //     }
  //     if (description) {
  //       validateNonEmpty(description, "isDescription");
  //     }
  //     setIsFirstCheck(false);
  //   }
  // }, [basicForm]);

  // useEffect(() => {
  //   if (basicForm.imageDataUrl) {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, isTokenImage: true };
  //     });
  //   } else {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, isTokenImage: false };
  //     });
  //   }
  // }, [basicForm.imageDataUrl]);

  // const validateAddress = (value: string, isValidator: any) => {
  //   console.log("We are inside the validateAddress function");
  //   const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
  //   if (!standardAddressPattern.test(value)) {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: false };
  //     });
  //   } else {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: true };
  //     });
  //   }
  // };

  // const validateNonEmpty = (value: string, isValidator: any) => {
  //   if (value == "") {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: false };
  //     });
  //   } else {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: true };
  //     });
  //   }
  // };

  // const validateDecimal = (value: string, isValidator: any) => {
  //   const positiveIntegerPattern = /^\d+$/;
  //   if (!positiveIntegerPattern.test(value)) {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: false };
  //     });
  //   } else {
  //     setValidator((prevValidator: any) => {
  //       return { ...prevValidator, [isValidator]: true };
  //     });
  //   }
  // };

  console.log("Validator: ", validator);

  return (
    <>
      <section>
        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Project Token Address
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This is the address of the token to which you wish to incorporate
              utility within the insurance protocol. <br />
              <br />
              For example: <br />
              0x1234567890123456789012345678901234567890
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Token Address" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  validateAddress(value, "isTokenAddress");

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      tokenAddress: value,
                    };
                  });
                  //   setTokenAddress(value);
                }}
                type="text"
                value={basicForm.tokenAddress}
                placeholder={""}
                inputClassName="spin-button-hidden text-gray-800 text-xl"
              />
              {validator?.isTokenAddress === false && (
                <p className="py-2 text-red-700">Token Address is not valid</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Project Treasury Address
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This is the address of the token that will receive insurance fees
              from investors <br />
              <br />
              For example: <br />
              0x1234567890123456789012345678901234567890
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Treasury Address" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  validateAddress(value, "isTreasuryAddress");

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      treasuryAddress: value,
                    };
                  });
                }}
                value={basicForm.treasuryAddress}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {validator?.isTreasuryAddress === false && (
                <p className="py-2 text-red-700">
                  Treasury Address is not valid
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Project Token Name
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This is the name of the token
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Token Name" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  validateNonEmpty(value, "isTokenName");

                  // if (value == "") {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTokenName: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTokenName: true };
                  //   });
                  // }

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      tokenName: value,
                    };
                  });
                }}
                value={basicForm.tokenName}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {validator?.isTokenName === false && (
                <p className="py-2 text-red-700">Token name cannot be empty</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Project Token Symbol
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This is the symbol of the token
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Token Symbol" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  validateNonEmpty(value, "isTokenSymbol");

                  // if (value == "") {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTokenSymbol: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTokenSymbol: true };
                  //   });
                  // }

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      tokenSymbol: value,
                    };
                  });
                }}
                value={basicForm.tokenSymbol}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {validator?.isTokenSymbol === false && (
                <p className="py-2 text-red-700">
                  Token symbol field cannot be empty
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Project Token Decimal
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              This is the token decimal
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Token Decimal" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  validateDecimal(value, "isTokenDecimal");
                  // const positiveIntegerPattern = /^\d+$/;
                  // if (!positiveIntegerPattern.test(value)) {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTokenDecimal: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTokenDecimal: true };
                  //   });
                  // }

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      tokenDecimal: value,
                    };
                  });
                }}
                value={basicForm.tokenDecimal}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {validator?.isTokenDecimal === false && (
                <p className="py-2 text-red-700">
                  Decimal should be an integer
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">Description</h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Write a description on the utilities provided by your token. This
              is really going to help in getting investors and sponsors.
            </p>
          </div>
          <div className="md:w-7/12 md:px-11 mt-4 md:mt-0">
            <div>
              <InputLabel title="Description" />
              <textarea
                onChange={(event) => {
                  const { value } = event.target;
                  const truncatedValue = value.slice(
                    0,
                    totalNumberOfCharacters
                  );

                  validateNonEmpty(value, "isDescription");

                  // if (value == "") {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isDescription: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isDescription: true };
                  //   });
                  // }

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      description: truncatedValue,
                    };
                  });
                }}
                value={basicForm.description}
                cols={50}
                wrap="soft"
                placeholder="Write a description note"
                id="note"
                className="w-full h-40 md:h-60 text-clip block p-2 md:text-base text-xs mt-1 border border-gray-300 focus:outline-none rounded-md"
              ></textarea>
              <div className="flex justify-end items-center">
                <p
                  className={`py-2 w-6/12 ${
                    validator?.isDescription === false
                      ? "text-red-700"
                      : "hidden"
                  }`}
                >
                  Description field cannot be empty
                </p>

                <p className="text-right mt-2 w-6/12 text-base">
                  {basicForm.description ? basicForm.description.length : 0} /{" "}
                  {totalNumberOfCharacters}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col border-t my-11 border-gray-300 py-11 md:px-16 px-5">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">Token Image</h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Select an image that best represent your token. Make sure it is
              clear and not exceed 5 mb.
            </p>
          </div>
          <div className="md:w-7/12 md:px-11 ">
            {isImageProcessing ? (
              <div className="border border-gray-300 w-[500px] h-[500px] hover:bg-gray-200 cursor-pointer flex flex-col items-center justify-center">
                <LoadingIcon icon="three-dots" className="w-12 h-12" />
                <p className="text-xl">Image is Processing</p>
                <p className="text-sm mt-2">
                  Feel free to move on - Image will appear here when it is ready
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 w-[500px] h-[500px] hover:bg-gray-200 cursor-pointer">
                {!(basicForm.imageDataUrl && !isImageChanged) ? (
                  <ImageUploading
                    multiple
                    value={images}
                    onChange={onChange}
                    maxNumber={maxNumber}
                    maxFileSize={maxFileSize}
                    resolutionHeight={resolutionHeight}
                    resolutionWidth={resolutionWidth}
                    resolutionType={resolutionType}
                    acceptType={acceptType}
                  >
                    {({
                      imageList,
                      onImageUpload,
                      onImageUpdate,
                      isDragging,
                      dragProps,
                      errors,
                    }) => {
                      // if (errors) {
                      //   console.log("Errors: ", errors);
                      //   setBasicForm((prevBasicForm) => {
                      //     return {
                      //       ...prevBasicForm,
                      //       imageDataUrl: "",
                      //     };
                      //   });

                      //   //  setValidator((prevValidator: any) => {
                      //   //    return { ...prevValidator, isTokenImage: false };
                      //   //  });
                      // }
                      return (
                        <div>
                          {errors ? (
                            <div className="w-[500px] h-[500px] flex flex-col justify-center items-center">
                              {errors.maxFileSize && (
                                <p>File size should be less than 5mb</p>
                              )}
                              {errors.resolution && (
                                <p>
                                  {errors.resolution}
                                  Image resolution should be less than 500 x 500
                                </p>
                              )}
                              {errors.acceptType && (
                                <p>Image type should be JPG, PNG, or SVG</p>
                              )}
                              <button
                                onClick={() => {
                                  setImageChanged(true);
                                  onImageUpload();
                                }}
                                className="bg-gray-300 p-2 px-3 rounded-md mt-4 hover:bg-gray-400yuyu"
                              >
                                <p className="px-2">
                                  <Upload className="inline" /> Select an Image
                                </p>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div
                                className="w-[500px] h-[500px] flex flex-col justify-center"
                                style={
                                  isDragging ? { color: "red" } : undefined
                                }
                                onClick={() => {
                                  console.log("This is where I am");
                                  onImageUpload();
                                  setImageChanged(true);
                                }}
                                {...dragProps}
                              >
                                {imageList.length <= 0 && (
                                  <div className="text-center">
                                    <p className="text-sm">Select a File</p>
                                    <p className="text-sm text-gray-500 px-2">
                                      <small>
                                        It must be a JPG, PNG or SVG.
                                      </small>
                                    </p>
                                    <p className="px-2 text-sm text-gray-500">
                                      <small>
                                        Image dimension must be {validWidth} x{" "}
                                        {validHeight}
                                      </small>
                                    </p>
                                  </div>
                                )}
                                {imageList.map((image, index) => (
                                  <div key={index} className="">
                                    <img
                                      src={image?.dataURL}
                                      alt=""
                                      width={500}
                                      height={500}
                                    />
                                  </div>
                                ))}
                              </div>
                              {imageList.length > 0 && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => onImageUpdate(0)}
                                    className="bg-gray-200 p-2 px-3 rounded-md"
                                  >
                                    <Upload />
                                  </button>
                                  {/* <button
                            onClick={() => onImageRemove(0)}
                            className="bg-gray-200 p-2 px-3 rounded-md"
                          >
                            <Trash />
                          </button> */}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </ImageUploading>
                ) : (
                  <ImageUploading
                    multiple
                    value={images}
                    onChange={onChange}
                    maxNumber={maxNumber}
                    maxFileSize={maxFileSize}
                    resolutionHeight={resolutionHeight}
                    resolutionWidth={resolutionWidth}
                    resolutionType={resolutionType}
                    acceptType={acceptType}
                  >
                    {({ imageList, onImageUpload, isDragging, dragProps }) => (
                      // write your building UI
                      <div className="space-y-3">
                        <div
                          className="w-[500px] h-[500px] flex flex-col justify-center"
                          style={isDragging ? { color: "red" } : undefined}
                          onClick={onImageUpload}
                          {...dragProps}
                        >
                          <img
                            src={basicForm.imageDataUrl}
                            alt=""
                            width={500}
                            height={500}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setImageChanged(true);
                              onImageUpload();
                            }}
                            className="bg-gray-200 p-2 px-3 rounded-md"
                          >
                            <Upload />
                          </button>
                          {/* <button
                          onClick={() => onImageRemove(0)}
                          className="bg-gray-200 p-2 px-3 rounded-md"
                        >
                          <Trash />
                        </button> */}
                        </div>
                      </div>
                    )}
                  </ImageUploading>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-center text-center sm:block sm:p-0 mt-2"></div>
    </>
  );
}
