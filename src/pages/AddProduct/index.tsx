import Lucide from "../../base-components/Lucide";
import TomSelect from "../../base-components/TomSelect";
import { ClassicEditor } from "../../base-components/Ckeditor";
import {
  FormLabel,
  FormCheck,
  FormInput,
  FormInline,
  FormSelect,
  FormSwitch,
  InputGroup,
  FormHelp,
} from "../../base-components/Form";
import Alert from "../../base-components/Alert";
import Tippy from "../../base-components/Tippy";
import products from "../../fakers/products";
import Button from "../../base-components/Button";
import Table from "../../base-components/Table";
import { useState } from "react";
import clsx from "clsx";
import _ from "lodash";
import computerLab from "../../fakers/lab-categories";
import ImageUploading, { ImageListType } from "react-images-uploading";
import React from "react";
import LoadingIcon from "../../base-components/LoadingIcon";
import { Upload } from "lucide-react";
import axios from "axios";

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

const indexToCategory: { [key: number]: string } = {
  0: "Hardware",
  1: "Software",
  2: "Accessories",
  3: "Furniture & Ergonomics",
  4: "Educational Resources",
};

function Main() {
  const [subcategory, setSubcategory] = useState(["0"]);
  const [editorData, setEditorData] = useState("<p>Content of the editor.</p>");
  const [images, setImages] = useState([]);
  const maxNumber = 1;
  const maxFileSize = 5242880; // 5mb
  const resolutionWidth = 350;
  const resolutionHeight = 350;
  const resolutionType = "less";
  const acceptType = ["svg", "jpg", "png"];
  const [isImageChanged, setImageChanged] = useState(false);
  const [isImageProcessing, setImageProcessing] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState(0);

  const validWidth: number = 500;
  const validHeight: number = 500;
  const totalNumberOfCharacters = 300;
  const [imageUrl, setImageUrl] = useState("");

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

    console.log("Image data url: ", imageDataUrl);
    setImageUrl(imageDataUrl);

    setImages(imageList as never[]);

    setImageProcessing(false);
  };

  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const [productDetails, setProductDetails] = useState({
    imageDataUrl: "",
  });

  console.log("ID: ", id);
  console.log("Name: ", name);
  console.log("Product details: ", productDetails);
  console.log("Description", editorData);
  console.log("Images: ", imageUrl);
  console.log("Category: ", indexToCategory[categoryIndex]);

  const handleAddNew = async () => {
    console.log("Adding a new product: ");
    const newProduct = {
      tagId: id,
      name: name,
      category: indexToCategory[categoryIndex],
      status: "Active",
      imageUrl: imageUrl,
      description: editorData,
      allocatedTo: "",
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_PINATA_BACKEND_URL}/api/products/add-product`,
        newProduct
      );
      alert("Product has been added successfully");
    } catch (error) {
      console.error("Error adding the product:", error);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col mt-4 md:mt-0 md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Add Product
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-12 xl:grid-cols-10 gap-y-7 lg:gap-y-10 gap-x-6">
          <div className="relative flex flex-col col-span-12 lg:col-span-9 xl:col-span-8 gap-y-7">
            <div className="flex flex-col p-5 box box--stacked">
              <div className="p-5 border rounded-[0.6rem] border-slate-200/60 dark:border-darkmode-400">
                <div className="flex items-center pb-5 text-[0.94rem] font-medium border-b border-slate-200/60 dark:border-darkmode-400">
                  <Lucide
                    icon="ChevronDown"
                    className="w-5 h-5 stroke-[1.3] mr-2"
                  />{" "}
                  Product Information
                </div>
                <div className="mt-5">
                  <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                    <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                      <div className="text-left">
                        <div className="flex items-center">
                          <div className="font-medium">Product Tag ID</div>
                          <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                            Optional
                          </div>
                        </div>
                        <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80">
                          Enter the tag ID to track the real-time location of
                          product.
                        </div>
                      </div>
                    </label>
                    <div className="flex-1 w-full mt-3 xl:mt-0">
                      <FormInput
                        type="text"
                        placeholder="Product ID"
                        onChange={(event) => {
                          setId(event.target.value);
                        }}
                      />
                      <FormHelp>Maximum character 0/70</FormHelp>
                    </div>
                  </div>
                  <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                    <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                      <div className="text-left">
                        <div className="flex items-center">
                          <div className="font-medium">Product Name</div>
                          <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                            Required
                          </div>
                        </div>
                        <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80">
                          Enter the unique name of your product. Make it
                          descriptive and easy to remember for customers.
                        </div>
                      </div>
                    </label>
                    <div className="flex-1 w-full mt-3 xl:mt-0">
                      <FormInput
                        type="text"
                        placeholder="Product name"
                        onChange={(event) => {
                          setName(event.target.value);
                        }}
                      />
                      <FormHelp>Maximum character 0/70</FormHelp>
                    </div>
                  </div>
                  <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                    <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                      <div className="text-left">
                        <div className="flex items-center">
                          <div className="font-medium">Category</div>
                          <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                            Required
                          </div>
                        </div>
                        <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80">
                          Select the primary category that best represents your
                          product. This helps customers find your product more
                          easily.
                        </div>
                      </div>
                    </label>
                    <div className="flex-1 w-full mt-3 xl:mt-0">
                      <FormSelect
                        id="category"
                        onChange={(event) => {
                          setCategoryIndex(Number(event.target.value));
                        }}
                      >
                        {computerLab.labCategories().map((faker, fakerKey) => (
                          <option key={fakerKey} value={fakerKey}>
                            {faker.name}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col p-5 box box--stacked">
              <div className="p-5 border rounded-[0.6rem] border-slate-200/80 dark:border-darkmode-400">
                <div className="flex items-center pb-5 text-[0.94rem] font-medium border-b border-slate-200/80 dark:border-darkmode-400">
                  <Lucide
                    icon="ChevronDown"
                    className="w-5 h-5 stroke-[1.3] mr-2"
                  />{" "}
                  Upload Product
                </div>
                <div className="mt-5">
                  <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                    <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                      <div className="text-left">
                        <div className="flex items-center">
                          <div className="font-medium">Product Photos</div>
                          <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                            Required
                          </div>
                        </div>
                        <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80">
                          High-quality images can significantly impact your
                          product's appeal. Upload clear, well-lit photos that
                          showcase your item from different angles and
                          perspectives.
                        </div>
                      </div>
                    </label>
                    <div className="md:w-7/12 my-10 ">
                      {isImageProcessing ? (
                        <div className="border border-gray-300 w-[500px] h-[500px] hover:bg-gray-200 cursor-pointer flex flex-col items-center justify-center">
                          <LoadingIcon
                            icon="three-dots"
                            className="w-12 h-12"
                          />
                          <p className="text-xl">Image is Processing</p>
                          <p className="text-sm mt-2">
                            Feel free to move on - Image will appear here when
                            it is ready
                          </p>
                        </div>
                      ) : (
                        <div className="border border-gray-300 w-[350px] h-[350px] hover:bg-gray-200 cursor-pointer">
                          {!(productDetails.imageDataUrl && !isImageChanged) ? (
                            <ImageUploading
                              multiple
                              value={images}
                              onChange={onChange}
                              maxNumber={maxNumber}
                              maxFileSize={maxFileSize}
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
                                return (
                                  <div>
                                    {errors ? (
                                      <div className="w-[350px] h-[350px] flex flex-col justify-center items-center">
                                        {errors.maxFileSize && (
                                          <p>
                                            File size should be less than 5mb
                                          </p>
                                        )}
                                        {errors.acceptType && (
                                          <p>
                                            Image type should be JPG, PNG, or
                                            SVG
                                          </p>
                                        )}
                                        <button
                                          onClick={() => {
                                            setImageChanged(true);
                                            onImageUpload();
                                          }}
                                          className="bg-gray-300 p-2 px-3 rounded-md mt-4 hover:bg-gray-400yuyu"
                                        >
                                          <p className="px-2">
                                            <Upload className="inline" /> Select
                                            an Image
                                          </p>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <div
                                          className="w-[350px] h-[350px] flex flex-col justify-center"
                                          style={
                                            isDragging
                                              ? { color: "red" }
                                              : undefined
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
                                              <p className="text-sm">
                                                Select a File
                                              </p>
                                              <p className="text-sm text-gray-500 px-2">
                                                <small>
                                                  It must be a JPG, PNG or SVG.
                                                </small>
                                              </p>
                                            </div>
                                          )}
                                          {imageList.map((image, index) => {
                                            return (
                                              <div key={index} className="">
                                                <img
                                                  src={image?.dataURL}
                                                  alt=""
                                                  width={350}
                                                  height={350}
                                                />
                                              </div>
                                            );
                                          })}
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
                              {({
                                imageList,
                                onImageUpload,
                                isDragging,
                                dragProps,
                              }) => (
                                // write your building UI
                                <div className="space-y-3">
                                  <div
                                    className="w-[500px] h-[500px] flex flex-col justify-center"
                                    style={
                                      isDragging ? { color: "red" } : undefined
                                    }
                                    onClick={onImageUpload}
                                    {...dragProps}
                                  >
                                    <img
                                      src={productDetails.imageDataUrl}
                                      alt=""
                                      width={350}
                                      height={350}
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
                </div>
              </div>
            </div>
            <div className="flex flex-col p-5 box box--stacked">
              <div className="p-5 border rounded-[0.6rem] border-slate-200/60 dark:border-darkmode-400">
                <div className="flex items-center pb-5 text-[0.94rem] font-medium border-b border-slate-200/60 dark:border-darkmode-400">
                  <Lucide
                    icon="ChevronDown"
                    className="w-5 h-5 stroke-[1.3] mr-2"
                  />{" "}
                  Product Details
                </div>
                <div className="mt-5">
                  <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                    <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                      <div className="text-left">
                        <div className="flex items-center">
                          <div className="font-medium">Product Description</div>
                          <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                            Required
                          </div>
                        </div>
                        <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80">
                          Craft a comprehensive description that highlights the
                          unique features, benefits, and specifications of your
                          product.
                        </div>
                      </div>
                    </label>
                    <div className="flex-1 w-full mt-3 xl:mt-0">
                      <ClassicEditor
                        value={editorData}
                        onChange={setEditorData}
                      />
                      <FormHelp className="text-right">
                        Maximum character 0/2000
                      </FormHelp>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 mt-1 md:flex-row">
              <Button
                variant="outline-secondary"
                className="w-full border-slate-300/80 bg-white/80 md:w-56 py-2.5 rounded-[0.5rem]"
              >
                <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="outline-secondary"
                className="w-full border-slate-300/80 bg-white/80 md:w-56 py-2.5 rounded-[0.5rem]"
                onClick={handleAddNew}
              >
                <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
                Save & Add New
              </Button>
              <Button
                variant="primary"
                className="w-full md:w-56 py-2.5 rounded-[0.5rem]"
                onClick={handleAddNew}
              >
                <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          <div className="relative order-first col-span-12 lg:order-last lg:col-span-3 xl:col-span-2">
            <div className="sticky top-[104px]">
              <ul className="relative flex flex-col py-2.5 rounded-[0.6rem] bg-primary/[0.03] group-[.mode--light]:bg-slate-300/10 border border-primary/10 group-[.mode--light]:border-slate-300/20 text-slate-600/80">
                <li
                  className={clsx([
                    "relative pl-5 py-[9.2px] group-[.mode--light]:text-white/90 [&.active]:text-primary [&.active]:font-medium [&.active]:before:bg-primary/70 [.group.mode--light_&.active]:text-white [.group.mode--light_&.active]:before:bg-white active",
                    "before:content-[''] before:absolute before:h-[60%] before:w-0.5 before:left-0 before:inset-y-0 before:my-auto before:-ml-px",
                  ])}
                >
                  <a className="block -mt-px truncate" href="">
                    Product Information
                  </a>
                </li>
                <li
                  className={clsx([
                    "relative px-5 py-[9.2px] group-[.mode--light]:text-white/90 [&.active]:text-primary [&.active]:font-medium [&.active]:before:bg-primary/70 [.group.mode--light_&.active]:text-white [.group.mode--light_&.active]:before:bg-white",
                    "before:content-[''] before:absolute before:h-[60%] before:w-0.5 before:left-0 before:inset-y-0 before:my-auto before:-ml-px",
                  ])}
                >
                  <a className="block -mt-px truncate" href="">
                    Upload Product
                  </a>
                </li>
                <li
                  className={clsx([
                    "relative px-5 py-[9.2px] group-[.mode--light]:text-white/90 [&.active]:text-primary [&.active]:font-medium [&.active]:before:bg-primary/70 [.group.mode--light_&.active]:text-white [.group.mode--light_&.active]:before:bg-white",
                    "before:content-[''] before:absolute before:h-[60%] before:w-0.5 before:left-0 before:inset-y-0 before:my-auto before:-ml-px",
                  ])}
                >
                  <a className="block -mt-px truncate" href="">
                    Product Detail
                  </a>
                </li>
              </ul>
              <div className="relative p-5 mt-7 border rounded-[0.6rem] bg-warning/[0.07] dark:bg-darkmode-600 border-warning/[0.15] dark:border-0">
                <Lucide
                  icon="Lightbulb"
                  className="absolute top-0 right-0 w-12 h-12 mt-5 mr-3 text-warning/80"
                />
                <h2 className="text-lg font-medium">Note</h2>
                <div className="mt-2 text-xs leading-relaxed text-slate-600/90 dark:text-slate-500">
                  <div>
                    The image format is .jpg .jpeg .png and a minimum size of
                    300 x 300 pixels (For optimal images use a minimum size of
                    700 x 700 pixels).
                  </div>
                  <div className="mt-2">
                    Select product photos or drag and drop the photos here.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
