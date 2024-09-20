import { FormCheck, FormInput, FormLabel } from "../../base-components/Form";
import Tippy from "../../base-components/Tippy";
import users from "../../fakers/users";
import Button from "../../base-components/Button";
import clsx from "clsx";
import _ from "lodash";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  
  const [isSigning, setIsSigning] = useState(false)
  const [signText, setSignText] = useState("Sign Up")

  const handleAddNew = async () => {

    setIsSigning(true)
    setSignText("Signing Up")
    const newProduct = {
      firstName,
      lastName,
      email,
      password,
      isAdmin: false,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_PINATA_BACKEND_URL}/api/users/add-user`,
        newProduct
      );
      alert("User has signed up successfully");

      navigate("/login");

    } catch (error) {
      console.error("Error signing up:", error);
    }finally {
      setIsSigning(false)
      setSignText("Sign Up")
    }
  };

  const isAllValid = () => {
      return firstName && lastName && email && isChecked && password === confirmPassword;
  }

  return (
    <>
      <div className="container grid lg:h-screen grid-cols-12 lg:max-w-[1550px] 2xl:max-w-[1750px] py-10 px-5 sm:py-14 sm:px-10 md:px-36 lg:py-0 lg:pl-14 lg:pr-12 xl:px-24">
        <div
          className={clsx([
            "relative z-50 h-full col-span-12 p-7 sm:p-14 bg-white rounded-2xl lg:bg-transparent lg:pr-10 lg:col-span-5 xl:pr-24 2xl:col-span-4 lg:p-0",
            "before:content-[''] before:absolute before:inset-0 before:-mb-3.5 before:bg-white/40 before:rounded-2xl before:mx-5",
          ])}
        >
          <div className="relative z-10 flex flex-col justify-center w-full h-full py-2">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center rounded-lg  ">
                <img src={"/unilogo.png"} className="w-[100px]" />
              </div>
            </div>
            <div className="mt-10">
              <div className="text-2xl font-medium">Sign Up As A User</div>
              <div className="mt-2.5 text-slate-600">
                Already have an account?{" "}
                <a className="font-medium text-primary" href="">
                  Sign In
                </a>
              </div>
              <div className="mt-6">
                <FormLabel>First Name*</FormLabel>
                <FormInput
                  type="text"
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder={"Lanre"}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                <FormLabel className="mt-5">Last Name*</FormLabel>
                <FormInput
                  type="text"
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder={"Akintayo"}
                  onChange={(event) => setLastName(event.target.value)}
                />
                <FormLabel className="mt-5">Email*</FormLabel>
                <FormInput
                  type="text"
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder={"akintayolanre2019@gmail.com"}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FormLabel className="mt-5">Password*</FormLabel>
                <FormInput
                  type="password"
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder="************"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <div className="grid w-full h-1.5 grid-cols-12 gap-4 mt-3.5">
                  <div className="h-full col-span-3 border rounded active bg-slate-400/30 border-slate-400/20 [&.active]:bg-theme-1/30 [&.active]:border-theme-1/20"></div>
                  <div className="h-full col-span-3 border rounded active bg-slate-400/30 border-slate-400/20 [&.active]:bg-theme-1/30 [&.active]:border-theme-1/20"></div>
                  <div className="h-full col-span-3 border rounded active bg-slate-400/30 border-slate-400/20 [&.active]:bg-theme-1/30 [&.active]:border-theme-1/20"></div>
                  <div className="h-full col-span-3 border rounded bg-slate-400/30 border-slate-400/20 [&.active]:bg-theme-1/30 [&.active]:border-theme-1/20"></div>
                </div>
                <a
                  href=""
                  className="block mt-3 text-xs text-slate-500/80 sm:text-sm"
                >
                  What is a secure password?
                </a>
                <FormLabel className="mt-5">Password Confirmation*</FormLabel>
                <FormInput
                  type="password"
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder="************"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {confirmPassword !== password && (
                  <p className="text-[12px] text-red-500 py-2">
                    Password not the same
                  </p>
                )}

                <div className="flex items-center mt-5 text-xs text-slate-500 sm:text-sm">
                  <FormCheck.Input
                    id="remember-me"
                    type="checkbox"
                    className="mr-2 border"
                    checked={isChecked}
                    onChange={(event) => {
                      setIsChecked(event.target.checked);
                    }}
                  />
                  <label
                    className="cursor-pointer select-none"
                    htmlFor="remember-me"
                  >
                    I agree to the System
                  </label>
                  <a className="ml-1 text-primary dark:text-slate-200" href="">
                    Privacy Policy
                  </a>
                  .
                </div>
                <div className="mt-5 text-center xl:mt-8 xl:text-left">
                  <Button
                    variant="primary"
                    rounded
                    className={`bg-gradient-to-r from-theme-1/70 to-theme-2/70 w-full py-3.5 xl:mr-3 ${!isAllValid() && "cursor-not-allowed opacity-50"}`}
                    disabled={!isAllValid() || isSigning}
                    onClick={handleAddNew}
                  >
                    {signText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed container grid w-screen inset-0 h-screen grid-cols-12 lg:max-w-[1550px] 2xl:max-w-[1750px] pl-14 pr-12 xl:px-24">
        <div
          className={clsx([
            "relative h-screen col-span-12 lg:col-span-5 2xl:col-span-4 z-20",
            "after:bg-white after:hidden after:lg:block after:content-[''] after:absolute after:right-0 after:inset-y-0 after:bg-gradient-to-b after:from-white after:to-slate-100/80 after:w-[800%] after:rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0]",
            "before:content-[''] before:hidden before:lg:block before:absolute before:right-0 before:inset-y-0 before:my-6 before:bg-gradient-to-b before:from-white/10 before:to-slate-50/10 before:bg-white/50 before:w-[800%] before:-mr-4 before:rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0]",
          ])}
        ></div>
        <div
          className={clsx([
            "h-full col-span-7 2xl:col-span-8 lg:relative",
            "before:content-[''] before:absolute before:lg:-ml-10 before:left-0 before:inset-y-0 before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 before:w-screen before:lg:w-[800%]",
            "after:content-[''] after:absolute after:inset-y-0 after:left-0 after:w-screen after:lg:w-[800%] after:bg-texture-white after:bg-fixed after:bg-center after:lg:bg-[25rem_-25rem] after:bg-no-repeat",
          ])}
        >
          <div className="sticky top-0 z-10 flex-col justify-center hidden h-screen ml-16 lg:flex xl:ml-28 2xl:ml-36">
            <div className="leading-[1.4] text-[2.6rem] xl:text-5xl font-medium xl:leading-[1.2] text-white">
              Experience Seamless <br /> and Swift Asset Management
            </div>
            <div className="mt-5 text-base leading-relaxed xl:text-lg text-white/70">
              Effortlessly manage your assets with a system designed for speed
              and simplicity, ensuring smooth operations and quick results every
              time.
            </div>
          </div>
        </div>
      </div>
      <ThemeSwitcher />
    </>
  );
}

export default Main;
