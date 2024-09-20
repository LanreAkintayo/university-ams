import Lucide from "../../base-components/Lucide";
import { Menu, Popover } from "../../base-components/Headless";
import { FormCheck, FormInput } from "../../base-components/Form";
import FileIcon from "../../base-components/FileIcon";
import Tippy from "../../base-components/Tippy";
import activities from "../../fakers/activities";
import users from "../../fakers/users";
import messages from "../../fakers/messages";
import events from "../../fakers/events";
import projectDetails from "../../fakers/project-details";
import achievements from "../../fakers/achievements";
import Button from "../../base-components/Button";
import Table from "../../base-components/Table";
import { Tab } from "../../base-components/Headless";
import ImageZoom from "../../base-components/ImageZoom";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import clsx from "clsx";
import _ from "lodash";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Product } from "../../types/general";
import { ClassicEditor } from "../../base-components/Ckeditor";

function Main() {
  const { productId } = useParams();

  const [product, setProduct] = useState<Product | null>(null);

  const [isAdmin, setIsAdmin] = useState(() => {
    // Load user from local storage if available
    const isAnAdmin = localStorage.getItem("isAdmin");
    return isAnAdmin ? JSON.parse(isAnAdmin) : null;
  });

  const getProduct = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/products/all-products"
      );
      const allProducts = await Promise.all(response.data);

      console.log("All Products: ", allProducts);
      return allProducts.find((product) => product.tagId === productId);
    } catch (error) {
      console.log("Error fetching products: ", error);
    }
  };

  useEffect(() => {
    const resolve = async () => {
      const currentProduct = (await getProduct()) as unknown as Product;
      setProduct(currentProduct);
    };

    if (!product || !product.tagId) {
      resolve();
    }
  }, [product]);

  console.log("Product: ", product);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (queryParams.get("page") == "events") {
      setSelectedIndex(1);
    } else if (queryParams.get("page") == "achievements") {
      setSelectedIndex(2);
    } else if (queryParams.get("page") == "contacts") {
      setSelectedIndex(3);
    } else if (queryParams.get("page") == "default") {
      setSelectedIndex(4);
    } else {
      setSelectedIndex(0);
    }
  }, [search]);

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <Tab.Group
          className="mt-10"
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
        >
          <div className="flex flex-col 2xl:items-center 2xl:flex-row gap-y-3">
            <Tab.List
              variant="boxed-tabs"
              className="flex-col sm:flex-row w-full 2xl:w-auto mr-auto bg-white box rounded-[0.6rem] border-slate-200"
            >
              <Tab className="bg-slate-50 first:rounded-l-[0.6rem] last:rounded-r-[0.6rem] [&[aria-selected='true']_button]:text-current">
                <Tab.Button
                  className="w-full xl:w-40 py-2.5 text-slate-500 whitespace-nowrap rounded-[0.6rem] flex items-center justify-center text-[0.94rem]"
                  as="button"
                >
                  Profile
                </Tab.Button>
              </Tab>

              <Tab className="bg-slate-50 first:rounded-l-[0.6rem] last:rounded-r-[0.6rem] [&[aria-selected='true']_button]:text-current">
                <Tab.Button
                  className="w-full xl:w-40 py-2.5 text-slate-500 whitespace-nowrap rounded-[0.6rem] flex items-center justify-center text-[0.94rem]"
                  as="button"
                >
                  Events
                  <div className="flex items-center justify-center h-5 px-1.5 ml-2 text-xs font-medium border rounded-full text-theme-1/70 bg-theme-1/10 border-theme-1/10">
                    3
                  </div>
                </Tab.Button>
              </Tab>
            </Tab.List>
            <div className="flex items-center gap-3 2xl:ml-auto">
              <Menu className="mr-auto 2xl:mr-0">
                {/* <Menu.Button
                  as={Button}
                  variant="secondary"
                  className="rounded-[0.6rem] bg-white py-3"
                >
                  <Lucide
                    icon="Download"
                    className="stroke-[1.3] w-4 h-4 mr-2"
                  />
                  <span className="truncate max-w-[3.8rem] sm:max-w-none">
                    Share Profile
                  </span>
                  <Lucide
                    icon="ChevronDown"
                    className="stroke-[1.3] w-4 h-4 ml-2"
                  />
                </Menu.Button> */}
                <Menu.Items className="w-48">
                  <Menu.Item>
                    <Lucide icon="Linkedin" className="w-4 h-4 mr-2" /> Share to
                    Linkedin
                  </Menu.Item>
                  <Menu.Item>
                    <Lucide icon="Facebook" className="w-4 h-4 mr-2" />
                    Share to Facebook
                  </Menu.Item>
                  <Menu.Item>
                    <Lucide icon="Twitter" className="w-4 h-4 mr-2" />
                    Share to Twitter
                  </Menu.Item>
                </Menu.Items>
              </Menu>
              <Popover className="inline-block">
                {({ close }) => (
                  <>
                    <Popover.Panel placement="bottom-end">
                      <div className="p-2">
                        <div>
                          <div className="text-left">Invite by Email</div>
                          <FormInput
                            className="flex-1 mt-2"
                            placeholder={users.fakeUsers()[1].email}
                            type="text"
                          />
                        </div>
                        <div className="flex items-center mt-4">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              close();
                            }}
                            className="w-32 ml-auto"
                          >
                            Close
                          </Button>
                          <Button variant="primary" className="w-32 ml-2">
                            Search
                          </Button>
                        </div>
                      </div>
                    </Popover.Panel>
                  </>
                )}
              </Popover>
              <Menu>
                <Menu.Button
                  as={Button}
                  variant="secondary"
                  className="rounded-[0.6rem] bg-white py-3 text-[0.94rem]"
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    <Lucide
                      icon="MoreVertical"
                      className="stroke-[1.3] w-4 h-4"
                    />
                  </div>
                </Menu.Button>
                <Menu.Items className="w-44">
                  <Menu.Item>
                    <Lucide icon="Settings" className="w-4 h-4 mr-2" /> Settings
                  </Menu.Item>
                  <Menu.Item>
                    <Lucide icon="Contact" className="w-4 h-4 mr-2" /> Contacts
                  </Menu.Item>
                  <Menu.Item className="text-danger">
                    <Lucide icon="Lock" className="w-4 h-4 mr-2" />
                    Lock Account
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          </div>
          <Tab.Panels>
            <Tab.Panel>
              <div className="grid grid-cols-12 gap-y-7 gap-x-6 mt-3.5">
                <div className="col-span-12 xl:col-span-8">
                  <div className="flex flex-col gap-y-7">
                    <div className="flex flex-col p-5 box box--stacked">
                      <div className="pb-5 mb-5 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                        Product Information
                      </div>
                      {product && (
                        <div>
                          <div className="mt-2 border border-slate-200 py-2 rounded-md shadow-xl">
                            <img
                              alt=""
                              className="rounded-md"
                              src={product.imageUrl}
                            />
                          </div>
                          <p className="mt-5 text-2xl font-bold">
                            {product.name}
                          </p>

                          <div
                            className="mt-2 text-lg"
                            dangerouslySetInnerHTML={{
                              __html: product.description,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col p-5 box box--stacked mt-4">
                      <p className="py-2 pb-3">Product Metrics</p>
                      <div className="grid grid-cols-4 gap-5">
                        <div className="col-span-4 md:col-span-2 xl:col-span-1 p-5 border border-dashed rounded-[0.6rem] border-slate-300/80 box shadow-sm">
                          <div className="text-base text-slate-500">Tag ID</div>
                          <div className="mt-1.5 text-2xl font-medium">
                            {product?.tagId}
                          </div>
                        </div>
                        <div className="col-span-4 md:col-span-2 xl:col-span-1 p-5 border border-dashed rounded-[0.6rem] border-slate-300/80 box shadow-sm">
                          <div className="text-base text-slate-500">
                            Temperature
                          </div>
                          <div className="mt-1.5 text-2xl font-medium">
                            24.7°C
                          </div>
                          <div className="ml-4 absolute inset-y-0 right-0 flex flex-col justify-center mr-5">
                            <div className="flex items-center border border-danger/10 bg-danger/10 rounded-full pl-[7px] pr-1 py-[2px] text-xs font-medium text-danger">
                              3%
                              <Lucide
                                icon="ChevronDown"
                                className="w-4 h-4 ml-px stroke-[1.5]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative col-span-12 row-start-1 xl:col-start-9 xl:col-span-4">
                  <div className="sticky flex flex-col top-[6.2rem] gap-y-7">
                    <div className="flex flex-col p-5 box box--stacked">
                      <div className="pb-5 mb-5 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                        Profile
                      </div>
                      <div className="flex flex-col gap-8">
                        <div>
                          <div className="mt-3.5">
                            <div className="flex items-center">
                              <Lucide
                                icon="Clipboard"
                                className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                              />
                              Category: {product?.category}
                            </div>

                            <div className="flex items-center mt-3">
                              <Lucide
                                icon="Clock"
                                className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                              />
                              Status:
                              <div className="flex items-center text-xs font-medium rounded-md text-success bg-success/10 border border-success/10 px-1.5 py-px ml-1">
                                <span className="-mt-px">
                                  {product?.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center mt-3">
                              <Lucide
                                icon="Clipboard"
                                className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                              />
                              Allocated To: {"Gbenga"}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-slate-500">
                            Contacts
                          </div>
                          <div className="mt-3.5">
                            <div className="flex items-center">
                              <Lucide
                                icon="Clipboard"
                                className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                              />
                              Email:{" "}
                              <a
                                href=""
                                className="ml-1 text-primary whitespace-nowrap underline decoration-dotted decoration-primary/30 underline-offset-[3px]"
                              >
                                {"computersciencelab@gmail.com"}
                              </a>
                            </div>
                            <div className="flex items-center mt-3">
                              <Lucide
                                icon="Calendar"
                                className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                              />
                              Phone Number:{" "}
                              <a
                                href=""
                                className="ml-1 text-primary whitespace-nowrap underline decoration-dotted decoration-primary/30 underline-offset-[3px]"
                              >
                                {"+234 803 123 4567"}
                              </a>
                            </div>
                          </div>
                        </div>

                        {isAdmin === "true" ? (
                          <Button
                            variant="primary"
                            className="w-full mt-5 bg-white border-dashed text-primary border-primary/20 hover:bg-primary/20"
                          >
                            Track Asset
                            <Lucide
                              icon="ArrowRight"
                              className="stroke-[1.3] w-4 h-4 ml-2"
                            />
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-full mt-5 bg-white border-dashed text-primary border-primary/20 hover:bg-primary/20"
                          >
                            Request Asset
                            <Lucide
                              icon="ArrowRight"
                              className="stroke-[1.3] w-4 h-4 ml-2"
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-12 gap-y-7 gap-x-6 mt-3.5">
                <div className="col-span-12 xl:col-span-8">
                  <div className="flex flex-col gap-y-7">
                    <div className="flex flex-col p-5 box box--stacked">
                      <div className="pb-5 mb-5 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                        Asset Requests
                      </div>

                      <div className="border border-dashed rounded-[0.6rem] border-slate-300/80 mt-5">
                        <div className="flex items-center px-5 pt-3 pb-4 border-b border-dashed border-slate-300/80 last:border-0 hover:bg-slate-50">
                          <div className="flex flex-col w-full ml-2 sm:items-center sm:flex-row">
                            <div className="w-16 h-16">
                              <div className="w-full h-full overflow-hidden border-[6px] box border-white rounded-full image-fit">
                                <img
                                  alt="Tailwise - Admin Dashboard Template"
                                  src={"/lanre.png"}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col w-full sm:ml-5 md:flex-row md:items-center gap-y-3">
                              <label
                                htmlFor="checkbox-switch-3"
                                className="w-full cursor-pointer"
                              >
                                <div className="flex flex-col text-base font-medium sm:items-center sm:flex-row gap-y-2">
                                  Larry Mosh
                                  <div className="flex items-center text-xs font-medium rounded-md text-primary bg-primary/10 border border-primary/10 px-1.5 py-px sm:ml-2.5 mr-auto sm:mr-0">
                                    <span className="-mt-px">Pending</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 mt-1.5">
                                  <div className="">
                                    Requests for Product 124785
                                  </div>
                                  <div className="text-slate-500">
                                    Request Date - 19 Sep, 2024
                                  </div>
                                </div>
                              </label>
                              {isAdmin === "true" ? (
                                <div className="flex flex-col gap-3 sm:flex-row md:ml-auto">
                                  <Button
                                    variant="outline-secondary"
                                    className="pl-3.5 pr-4  whitespace-nowrap"
                                  >
                                    <Lucide
                                      icon="Check"
                                      className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                                    />{" "}
                                    Approve Request
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    className="pl-3.5 pr-4 whitespace-nowrap"
                                  >
                                    <Lucide
                                      icon="Trash"
                                      className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                                    />{" "}
                                    Reject Request
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-3 sm:flex-row md:ml-auto">
                                  <Button
                                    variant="outline-secondary"
                                    className="pl-3.5 pr-4 whitespace-nowrap cursor-default"
                                  >
                                    <Lucide
                                      icon="AlertCircle"
                                      className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                                    />{" "}
                                    Waiting for Approval
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center px-5 pt-3 pb-4 border-b border-dashed border-slate-300/80 last:border-0 hover:bg-slate-50">
                          <div className="flex flex-col w-full ml-2 sm:items-center sm:flex-row">
                            <div className="w-16 h-16">
                              <div className="w-full h-full overflow-hidden border-[6px] box border-white rounded-full image-fit">
                                <img
                                  alt="Tailwise - Admin Dashboard Template"
                                  src={"/timi.png"}
                                />
                              </div>
                            </div>

                            <div className="flex flex-col w-full sm:ml-5 md:flex-row md:items-center gap-y-3">
                              <label
                                htmlFor="checkbox-switch-3"
                                className="w-full cursor-pointer"
                              >
                                <div className="flex flex-col text-base font-medium sm:items-center sm:flex-row gap-y-2">
                                  Timilehin
                                  <div className="flex items-center text-xs font-medium rounded-md text-primary bg-danger/10 border border-primary/10 px-1.5 py-px sm:ml-2.5 mr-auto sm:mr-0">
                                    <span className="-mt-px">Canceled</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 mt-1.5">
                                  <div className="">
                                    Requested for Product 124785
                                  </div>
                                  <div className="text-slate-500">
                                    Request Date - 17 Sep, 2024
                                  </div>
                                </div>
                              </label>
                              {isAdmin === "true" ? (
                                <div className="flex flex-col gap-3 sm:flex-row md:ml-auto">
                                  <Button
                                    variant="outline-secondary"
                                    className="pl-3.5 pr-4 whitespace-nowrap"
                                  >
                                    <Lucide
                                      icon="Trash"
                                      className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                                    />{" "}
                                    Request Rejected
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-3 sm:flex-row md:ml-auto">
                                  <Button
                                    variant="outline-secondary"
                                    className="pl-3.5 pr-4 whitespace-nowrap cursor-default"
                                  >
                                    <Lucide
                                      icon="Trash"
                                      className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                                    />{" "}
                                    Request Rejected by Admin
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center px-5 pt-3 pb-4 border-b border-dashed border-slate-300/80 last:border-0 hover:bg-slate-50">
                          <div className="flex flex-col w-full ml-2 sm:items-center sm:flex-row">
                            <div className="w-16 h-16">
                              <div className="w-full h-full overflow-hidden border-[6px] box border-white rounded-full image-fit">
                                <img
                                  alt="Tailwise - Admin Dashboard Template"
                                  src={"/gfresh.png"}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col w-full sm:ml-5 md:flex-row md:items-center gap-y-3">
                              <label
                                htmlFor="checkbox-switch-3"
                                className="w-full cursor-pointer"
                              >
                                <div className="flex flex-col text-base font-medium sm:items-center sm:flex-row gap-y-2">
                                  Gbenga
                                  <div className="flex items-center text-xs font-medium rounded-md text-primary bg-success/10 border border-primary/10 px-1.5 py-px sm:ml-2.5 mr-auto sm:mr-0">
                                    <span className="-mt-px">Successful</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 mt-1.5">
                                  <div className="">
                                    Requested for Product 124785
                                  </div>
                                  <div className="text-slate-500">
                                    Request Date - 15 Sep, 2024
                                  </div>
                                </div>
                              </label>
                              {isAdmin === "true" ? (
                                <div className="flex flex-col gap-3 sm:flex-row md:ml-auto">
                                  <Button
                                    variant="outline-secondary"
                                    className="pl-3.5 pr-4  whitespace-nowrap"
                                  >
                                    <Lucide
                                      icon="Check"
                                      className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                                    />{" "}
                                    Request Approved
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-3 sm:flex-row md:ml-auto">
                                  <Button
                                    variant="outline-secondary"
                                    className="pl-3.5 pr-4  whitespace-nowrap cursor-default"
                                  >
                                    <Lucide
                                      icon="Check"
                                      className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                                    />{" "}
                                    Request Approved by Admin
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative col-span-12 row-start-1 xl:col-start-9 xl:col-span-4">
                  <div className="flex flex-col p-5 box box--stacked">
                    <div className="pb-5 mb-5 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                      Profile
                    </div>
                    <div className="flex flex-col gap-8">
                      <div>
                        <div className="mt-3.5">
                          <div className="flex items-center">
                            <Lucide
                              icon="Clipboard"
                              className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                            />
                            Category: {product?.category}
                          </div>

                          <div className="flex items-center mt-3">
                            <Lucide
                              icon="Clock"
                              className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                            />
                            Status:
                            <div className="flex items-center text-xs font-medium rounded-md text-success bg-success/10 border border-success/10 px-1.5 py-px ml-1">
                              <span className="-mt-px">{product?.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center mt-3">
                            <Lucide
                              icon="Clipboard"
                              className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                            />
                            Allocated To: {"Gbenga"}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-slate-500">
                          Contacts
                        </div>
                        <div className="mt-3.5">
                          <div className="flex items-center">
                            <Lucide
                              icon="Clipboard"
                              className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                            />
                            Email:{" "}
                            <a
                              href=""
                              className="ml-1 text-primary whitespace-nowrap underline decoration-dotted decoration-primary/30 underline-offset-[3px]"
                            >
                              {"computersciencelab@gmail.com"}
                            </a>
                          </div>
                          <div className="flex items-center mt-3">
                            <Lucide
                              icon="Calendar"
                              className="w-4 h-4 mr-2 stroke-[1.3] text-slate-500"
                            />
                            Phone Number:{" "}
                            <a
                              href=""
                              className="ml-1 text-primary whitespace-nowrap underline decoration-dotted decoration-primary/30 underline-offset-[3px]"
                            >
                              {"+234 803 123 4567"}
                            </a>
                          </div>
                        </div>
                      </div>

                      {isAdmin === "true" ? (
                        <Button
                          variant="primary"
                          className="w-full mt-5 bg-white border-dashed text-primary border-primary/20 hover:bg-primary/20"
                        >
                          Track Asset
                          <Lucide
                            icon="ArrowRight"
                            className="stroke-[1.3] w-4 h-4 ml-2"
                          />
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          className="w-full mt-5 bg-white border-dashed text-primary border-primary/20 hover:bg-primary/20"
                        >
                          Request Asset
                          <Lucide
                            icon="ArrowRight"
                            className="stroke-[1.3] w-4 h-4 ml-2"
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-12 gap-y-10 gap-x-6 mt-3.5">
                {_.take(achievements.fakeAchievements(), 9).map(
                  (faker, fakerKey) => (
                    <div
                      className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4 box box--stacked"
                      key={fakerKey}
                    >
                      <div className="flex mt-5 ml-5">
                        <span className="flex items-center text-xs font-medium rounded-md text-success bg-success/10 border border-success/10 px-2 py-0.5 mr-auto">
                          <span className="-mt-px">{faker.category}</span>
                        </span>
                      </div>
                      <Menu className="absolute top-0 right-0 mt-5 mr-5">
                        <Menu.Button className="w-5 h-5 text-slate-500">
                          <Lucide
                            icon="MoreVertical"
                            className="w-5 h-5 stroke-slate-400/70 fill-slate-400/70"
                          />
                        </Menu.Button>
                        <Menu.Items className="w-40">
                          <Menu.Item>
                            <Lucide icon="Copy" className="w-4 h-4 mr-2" /> Copy
                            Link
                          </Menu.Item>
                          <Menu.Item>
                            <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                            Delete
                          </Menu.Item>
                        </Menu.Items>
                      </Menu>
                      <div className="flex flex-col items-center px-5 pb-10 mt-5">
                        <div className="relative w-[72px] h-[72px]">
                          <div className="flex items-center justify-center w-full h-full overflow-hidden border rounded-full border-slate-200/70 bg-theme-1/5">
                            <Lucide
                              icon={faker.event.icon}
                              className="w-6 h-6 text-theme-1 fill-theme-1/10 stroke-[0.7]"
                            />
                          </div>
                        </div>
                        <div className="mt-3 font-medium text-primary text-[0.94rem]">
                          {faker.title}
                        </div>
                        <div className="mt-1.5 text-center text-slate-500">
                          {faker.description}
                        </div>
                        <div className="mt-5 text-xs uppercase text-slate-400">
                          Collaborators
                        </div>
                        <div className="flex justify-center mt-3">
                          <div className="w-10 h-10 image-fit zoom-in">
                            <Tippy
                              as="img"
                              alt="Tailwise - Admin Dashboard Template"
                              className="border-2 border-white rounded-full"
                              src={faker.collaborators[0].photo}
                              content={faker.collaborators[0].name}
                            />
                          </div>
                          <div className="w-10 h-10 -ml-3 image-fit zoom-in">
                            <Tippy
                              as="img"
                              alt="Tailwise - Admin Dashboard Template"
                              className="border-2 border-white rounded-full"
                              src={faker.collaborators[1].photo}
                              content={faker.collaborators[1].name}
                            />
                          </div>
                          <div className="w-10 h-10 -ml-3 image-fit zoom-in">
                            <Tippy
                              as="img"
                              alt="Tailwise - Admin Dashboard Template"
                              className="border-2 border-white rounded-full"
                              src={faker.collaborators[2].photo}
                              content={faker.collaborators[2].name}
                            />
                          </div>
                          <div className="w-10 h-10 -ml-3 image-fit zoom-in">
                            <Tippy
                              as="img"
                              alt="Tailwise - Admin Dashboard Template"
                              className="border-2 border-white rounded-full"
                              src={faker.collaborators[3].photo}
                              content={faker.collaborators[3].name}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex border-t border-slate-200/80">
                        <div className="flex flex-col items-center flex-1 py-3">
                          <div className="text-base font-medium">
                            {faker.level}
                          </div>
                          <div className="text-slate-500">Level</div>
                        </div>
                        <div className="flex flex-col items-center flex-1 py-3 border-x border-slate-200/80">
                          <div className="text-base font-medium">
                            {faker.duration}
                          </div>
                          <div className="text-slate-500">Duration</div>
                        </div>
                        <div className="flex flex-col items-center flex-1 py-3">
                          <div className="text-base font-medium">
                            {faker.score}
                          </div>
                          <div className="text-slate-500">Score</div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-12 gap-y-10 gap-x-6 mt-3.5">
                {_.take(users.fakeUsers(), 9).map((faker, fakerKey) => (
                  <div
                    className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4 box box--stacked"
                    key={fakerKey}
                  >
                    <Menu className="absolute top-0 right-0 mt-5 mr-5">
                      <Menu.Button className="w-5 h-5 text-slate-500">
                        <Lucide
                          icon="MoreVertical"
                          className="w-5 h-5 stroke-slate-400/70 fill-slate-400/70"
                        />
                      </Menu.Button>
                      <Menu.Items className="w-40">
                        <Menu.Item>
                          <Lucide icon="Copy" className="w-4 h-4 mr-2" /> Copy
                          Link
                        </Menu.Item>
                        <Menu.Item>
                          <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                          Delete
                        </Menu.Item>
                      </Menu.Items>
                    </Menu>
                    <div className="flex flex-col items-center px-5 pb-10 mt-10">
                      <div className="w-[72px] h-[72px] overflow-hidden rounded-full image-fit border-[3px] border-slate-200/70">
                        <img
                          alt="Tailwise - Admin Dashboard Template"
                          src={faker.photo}
                        />
                      </div>
                      <div className="mt-3 font-medium text-primary text-[0.94rem]">
                        {faker.name}
                      </div>
                      <div className="flex items-center justify-center gap-3 mt-2">
                        <div className="flex items-center text-slate-500">
                          <Lucide
                            icon="Hotel"
                            className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                          />
                          {faker.location}
                        </div>
                        <div className="flex items-center text-slate-500">
                          <Lucide
                            icon="Calendar"
                            className="w-3.5 h-3.5 mr-1.5 stroke-[1.3]"
                          />
                          {faker.joinedDate}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-5 sm:flex-row">
                        <span className="flex items-center text-xs font-medium rounded-md text-primary bg-primary/10 border border-primary/10 px-2 py-0.5">
                          <span className="-mt-px truncate">
                            {faker.department}
                          </span>
                        </span>
                        <span className="flex items-center text-xs font-medium rounded-md text-primary bg-primary/10 border border-primary/10 px-2 py-0.5">
                          <span className="-mt-px truncate">
                            {faker.position}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center px-5 py-4 border-t border-slate-200/80">
                      <div className="text-slate-500">
                        {_.random(20, 100)}+ Connections
                      </div>
                      {_.random(0, 1) ? (
                        <Button
                          variant="outline-primary"
                          className="px-4 ml-auto border-primary/50"
                        >
                          <Lucide
                            icon="UserPlus"
                            className="stroke-[1.3] w-4 h-4 -ml-0.5 mr-2"
                          />
                          Connect
                        </Button>
                      ) : (
                        <Button variant="primary" className="px-4 ml-auto">
                          <Lucide
                            icon="Check"
                            className="stroke-[1.3] w-4 h-4 -ml-0.5 mr-2"
                          />
                          Connected
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="flex flex-col items-center py-14 box box--stacked mt-3.5">
                <Lucide
                  icon="FileLock2"
                  className="stroke-[0.3] w-24 h-24 text-primary/70 fill-primary/5"
                />
                <div className="mt-5 text-base font-medium">
                  Two-Factor Authentication (2FA)
                </div>
                <div className="px-10 mt-1 text-center text-slate-500">
                  Enhance your account security by enabling Two-Factor
                  Authentication in the settings.
                </div>
                <Button variant="primary" className="mt-6">
                  <Lucide
                    icon="Lock"
                    className="stroke-[1.3] w-4 h-4 mr-2 -ml-0.5"
                  />
                  Enable Now
                </Button>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

export default Main;
