import React, { useEffect, useState } from "react";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import { RotateLoader, ClipLoader } from "react-spinners";
import Input from "../Input";
import InputLabel from "../InputLabel";
import { ArrowRight, MoveRight } from "lucide-react";
import { eachRight } from "lodash";
import { IProfileForm, IValidator } from "../CreateForm/indexReal";
import { profile } from "console";

export default function ProfileForm({
  profileForm,
  setProfileForm,
  validator,
  setValidator,
}: {
  profileForm: IProfileForm;
  setProfileForm: React.Dispatch<React.SetStateAction<IProfileForm>>;
  validator: IValidator | undefined;
  setValidator: React.Dispatch<React.SetStateAction<IValidator | undefined>>;
}) {
  return (
    <>
      <section>
        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Twitter Handle
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Enter your twitter handle <br />
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Twitter Handle" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  // if (value == "") {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTwitterHandle: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTwitterHandle: true };
                  //   });
                  // }

                  setProfileForm((prevProfileForm) => {
                    return {
                      ...prevProfileForm,
                      twitterHandle: value,
                    };
                  });
                }}
                type="text"
                value={profileForm.twitterHandle}
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {/* {validator?.isTwitterHandle === false && (
                <p className="py-2 text-red-700">Twitter handle is not valid</p>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Discord Handle
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Enter your discord handle <br />
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Discord  Handle" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  // if (value == "") {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isDiscordHandle: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isDiscordHandle: true };
                  //   });
                  // }

                  setProfileForm((prevProfileForm) => {
                    return {
                      ...prevProfileForm,
                      discordHandle: value,
                    };
                  });
                }}
                value={profileForm.discordHandle}
                type="text"
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {/* {validator?.isDiscordHandle === false && (
                <p className="py-2 text-red-700">Discord handle is not valid</p>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">
              Telegram Handle
            </h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Enter your telegram handle <br />
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Telegram Handle" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  // if (value == "") {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTelegramHandle: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isTelegramHandle: true };
                  //   });
                  // }

                  setProfileForm((prevProfileForm) => {
                    return {
                      ...prevProfileForm,
                      telegramHandle: value,
                    };
                  });
                }}
                type="text"
                value={profileForm.telegramHandle}
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {/* {validator?.isTelegramHandle === false && (
                <p className="py-2 text-red-700">
                  Telegram handle is not valid
                </p>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-t border-gray-300 py-11 md:px-16 px-5 ">
          <div className="md:w-5/12 ">
            <h1 className="text-gray-800 text-2xl font-medium">Website URL</h1>
            <p className="md:text-base text-sm text-gray-600 pt-3">
              Enter your website URL
              <br />
            </p>
          </div>
          <div className="w-12/12 md:w-7/12 md:px-11 mt-5 md:mt-0">
            <div className="items-start">
              <InputLabel title="Website URL" />
              <Input
                onChange={(event) => {
                  const { value } = event.target;

                  // if (value == "") {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isWebsiteUrl: false };
                  //   });
                  // } else {
                  //   setValidator((prevValidator: any) => {
                  //     return { ...prevValidator, isWebsiteUrl: true };
                  //   });
                  // }

                  setProfileForm((prevProfileForm) => {
                    return {
                      ...prevProfileForm,
                      websiteUrl: value,
                    };
                  });
                }}
                type="text"
                value={profileForm.websiteUrl}
                placeholder={""}
                inputClassName="spin-button-hidden text-xl text-gray-800"
              />
              {/* {validator?.isWebsiteUrl === false && (
                <p className="py-2 text-red-700">
                  Website url should not be empty
                </p>
              )} */}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center text-center sm:block sm:p-0 mt-2"></div>
    </>
  );
}
