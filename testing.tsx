import React, { useEffect, useRef, useState } from "react";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import { RotateLoader, ClipLoader } from "react-spinners";
import Input from "../Input";
import InputLabel from "../InputLabel";
import { ArrowRight, MoveRight } from "lucide-react";
import { eachRight } from "lodash";
import { IBasicForm } from "../../CreateForm";
import Moralis from "moralis/.";

export default function BasicForm({
  basicForm,
  setBasicForm,
}: {
  basicForm: IBasicForm;
  setBasicForm: React.Dispatch<React.SetStateAction<IBasicForm>>;
}) {
  // const hiddenFileInput = React.useRef(null);
  const [projectInfo, setProjectInfo] = useState({
    title: "",
    subtitle: "",
    note: "",
    imageSrc: "",
    launchDate: new Date(),
    duration: "",
    goal: "",
  });

  const getImageUrl = async () => {
    try {
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }
      if (imageFile) {
        const uploadArray = [
          {
            path: imageFile?.name,
            content: base64Data!,
          },
        ];

        console.log("Upload array: ", uploadArray);

        const response = await Moralis.EvmApi.ipfs.uploadFolder({
          abi: uploadArray,
        });

        console.log("Response: ", response);

        const imageUrl = response.result[0].path as string;

        console.log("Image URL is ", imageUrl)

        return imageUrl;
      }
    } catch (error) {
      return "";
    }
  };

  // For the image
  // For the image
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File>();
  const [imageSrc, setImageSrc] = useState("");
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [base64Data, setBase64Data] = useState<string | null>(null);

  const validWidth: number = 500;
  const validHeight: number = 500;

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

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      tokenAddress: value,
                    };
                  });
                  //   setTokenAddress(value);

                  //   const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
                  //   if (!standardAddressPattern.test(value)) {
                  //     setIsValidTokenAddress(false);
                  //   } else {
                  //     setIsValidTokenAddress(true);
                  //   }
                }}
                type="text"
                value={basicForm.tokenAddress}
                placeholder={""}
                inputClassName="spin-button-hidden text-[19px] text-gray-800"
              />
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

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      treasuryAddress: value,
                    };
                  });
                  //   setTokenAddress(value);

                  //   const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
                  //   if (!standardAddressPattern.test(value)) {
                  //     setIsValidTokenAddress(false);
                  //   } else {
                  //     setIsValidTokenAddress(true);
                  //   }
                }}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-[19px] text-gray-800"
              />
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

                  setBasicForm((prevBasicForm) => {
                    return {
                      ...prevBasicForm,
                      description: value,
                    };
                  });
                }}
                cols={50}
                wrap="soft"
                placeholder="Write a description note"
                id="note"
                className="w-full h-40 md:h-60 text-clip block p-2 md:text-base text-xs mt-1 border border-gray-300 focus:outline-none rounded-md"
              ></textarea>
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
            <div className="">
              <div className="border border-gray-300 w-[500px] h-[500px] hover:bg-gray-200">
                <button
                  className="w-full h-full"
                  id="image"
                  onClick={() => {
                    if (hiddenFileInput.current) {
                      const current = hiddenFileInput.current as any;
                      current.click();
                    }
                  }}
                >
                  {projectInfo.imageSrc ? (
                    <div className="w-full h-full">
                      <img
                        alt="..."
                        src={projectInfo.imageSrc}
                        className="object-cover w-full h-full"
                        width={500}
                        height={500}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        if (hiddenFileInput.current) {
                          const current = hiddenFileInput.current as any;
                          current.click();
                        }
                      }}
                    >
                      {imageSrc &&
                      imageDimensions.width == validWidth &&
                      imageDimensions.height == validHeight ? (
                        <div className="h-full w-full">
                          <img
                            alt="logo"
                            src={imageSrc}
                            width={500}
                            height={500}
                            className=""
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">Select a File</p>
                          <p className="text-sm text-gray-500 px-2">
                            <small>
                              It must be a JPG, PNG, GIF, TIFF, or BMP.
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
                    </div>
                  )}
                </button>
                <input
                  type="file"
                  id="imageSrc"
                  ref={hiddenFileInput}
                  style={{ display: "none" }}
                  onChange={(event) => {
                    const { value } = event.target;
                    console.log("Thread is here");

                    console.log("Event: ", event.target.files);

                    if (event.target.id == "imageSrc") {
                      const files = event.target.files;

                      let width: number;
                      let height: number;

                      console.log(files);

                      if (files && files.length > 0) {
                        const imageFile = files[0];
                        const reader = new FileReader();

                        reader.onload = (e) => {
                          // Get the file content as a base64-encoded string

                          const img = new Image();
                          img.onload = () => {
                            width = img.width;
                            height = img.height;

                            console.log(
                              `Width is ${width} and height is ${height}`
                            );

                            if (width != validWidth || height != validHeight) {
                              console.log(
                                `Image dimension should be ${validWidth} x ${validHeight} `
                              );

                              // Display a message
                            }

                            setImageDimensions({ width, height });
                          };

                          img.src = reader.result as string;

                          const base64String = (e.target?.result as string)
                            ?.toString()
                            ?.split(",")[1];

                          if (base64String) {
                            // Do something with base64String
                            setBase64Data(base64String);
                          } else {
                            // Handle the case when base64String is null or undefined
                            console.error(
                              "Error: Unable to read base64String from the file."
                            );
                          }
                        };

                        // Read the file as a data URL (base64 encoded)
                        reader.readAsDataURL(imageFile);

                        if (imageFile) {
                          setImageFile(imageFile);

                          setImageSrc(URL.createObjectURL(imageFile));
                        }
                      }
                    }
                  }}
                  className="w-80 block p-2 text-sm mt-1 border border-gray-300 focus:outline-none rounded-md"
                />

                <button onClick={() => getImageUrl()}>Get Image URL</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center text-center sm:block sm:p-0 mt-2"></div>
    </>
  );
}







import React from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { IBasicForm } from "../../CreateForm";

export default function BasicForm({
  basicForm,
  setBasicForm,
}: {
  basicForm: IBasicForm;
  setBasicForm: React.Dispatch<React.SetStateAction<IBasicForm>>;
}) {
  const [images, setImages] = React.useState([]);
  const maxNumber = 69;

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList as never[]);
  };

  return (
    <div className="">
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          // write your building UI
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            &nbsp;
            <button onClick={onImageRemoveAll}>Remove all images</button>
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image.dataURL} alt="" width="100" />
                <div className="image-item__btn-wrapper">
                  <button onClick={() => onImageUpdate(index)}>Update</button>
                  <button onClick={() => onImageRemove(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ImageUploading>

      <img
        src={`data:image/png;base64,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`}
        className="w-[300px] h-[300px]"
        alt=""
        width={100}
      />
    </div>
  );
}
