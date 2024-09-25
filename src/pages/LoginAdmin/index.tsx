import { FormCheck, FormInput, FormLabel } from "../../base-components/Form";
import Tippy from "../../base-components/Tippy";
import users from "../../fakers/users";
import Button from "../../base-components/Button";
import Alert from "../../base-components/Alert";
import Lucide from "../../base-components/Lucide";
import clsx from "clsx";
import _ from "lodash";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSigning, setIsSigning] = useState(false);
  const [signText, setSignText] = useState("Sign In");

  const [allUsers, setAllUsers] = useState<any>()

  const [lastEmail, setLastEmail] = useState(() => {
    // Load user from local storage if available
    const savedUser = localStorage.getItem('loggedInUserEmail');
    return savedUser ? JSON.parse(savedUser) : null;
  })


  console.log("last Email: ", lastEmail)

    const checkIfUserExists = () => {
      const userExists = allUsers ? allUsers.some((user: any) => user.email === email && user.password === password): false;
      return userExists; // Returns true if a user is found, otherwise false
    }

   const getAllUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_PINATA_BACKEND_URL}/api/users/all-users`);
      console.log("Reponse.data: ", response.data)
      return await Promise.all(response.data)
    } catch (error) {
      console.log("Error fetching products: ", error);
    }
  };

  useEffect(() => {
    const resolve = async () => {
      const allUser = await getAllUsers()
      setAllUsers(allUser)
    }

    if (allUsers == undefined || allUsers.length <= 0){
      resolve()
    }
   
  }, [allUsers])

  const handleSignIn = async () => {
    setIsSigning(true);
    setSignText("Signing In");

    const isValid = checkIfUserExists()

    if (isValid){
      localStorage.setItem('loggedInUserEmail', JSON.stringify(email));
      localStorage.setItem('isAdmin', JSON.stringify("true"));
      navigate("/dashboard")
    } else{
      alert("Invalid Login Details. Try again")
    }

    setIsSigning(false);
      setSignText("Sign In");
  };

  const isAllValid = () => {
    return email && password;
  };

  return (
    <>
      <div className="container grid lg:h-screen grid-cols-12 lg:max-w-[1550px] 2xl:max-w-[1750px] py-10 px-5 sm:py-14 sm:px-10 md:px-36 lg:py-0 lg:pl-14 lg:pr-12 xl:px-24">
        <div
          className={clsx([
            "relative z-50 h-full col-span-12 p-7 sm:p-14 bg-white rounded-2xl lg:bg-transparent lg:pr-10 lg:col-span-5 xl:pr-24 2xl:col-span-4 lg:p-0",
            "before:content-[''] before:absolute before:inset-0 before:-mb-3.5 before:bg-white/40 before:rounded-2xl before:mx-5",
          ])}
        >
          <div className="relative z-10 flex flex-col justify-center w-full h-full py-2 lg:py-32">
            <div className="flex items-center justify-center rounded-lg  ">
              <img src={"/unilogo.png"} className="w-[100px]" />
            </div>

            <div className="mt-10">
              <div className="text-2xl font-medium">Sign In As A User</div>
              <div className="mt-2.5 text-slate-600">
                Don't have an account?{" "}
                <a className="font-medium text-primary" href="/register">
                  Sign Up
                </a>
              </div>

              <Alert
                variant="outline-primary"
                className="flex items-center px-4 py-3 my-7 bg-primary/5 border-primary/20 rounded-[0.6rem] leading-[1.7]"
              >
                {({ dismiss }) => (
                  <>
                    <div className="">
                      <Lucide
                        icon="Lightbulb"
                        className="stroke-[0.8] w-7 h-7 mr-2 fill-primary/10"
                      />
                    </div>
                    <div className="ml-1 mr-8">
                      Welcome to <span className="font-medium">UI</span> Asset
                      Management System! Simply click{" "}
                      <span className="font-medium">Sign In</span> to explore
                      and access our documentation.
                    </div>
                    <Alert.DismissButton
                      type="button"
                      className="btn-close text-primary"
                      onClick={dismiss}
                      aria-label="Close"
                    >
                      <Lucide icon="X" className="w-5 h-5" />
                    </Alert.DismissButton>
                  </>
                )}
              </Alert>
              <div className="mt-6">
                <FormLabel>Email*</FormLabel>
                <FormInput
                  type="text"
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder={"akintayolanre2019@gmail.com"}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FormLabel className="mt-4">Password*</FormLabel>
                <FormInput
                  type="password"
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder="************"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <div className="flex mt-4 text-xs text-slate-500 sm:text-sm">
                  <div className="flex items-center mr-auto">
                    <FormCheck.Input
                      id="remember-me"
                      type="checkbox"
                      className="mr-2.5 border"
                    />
                    <label
                      className="cursor-pointer select-none"
                      htmlFor="remember-me"
                    >
                      Remember me
                    </label>
                  </div>
                  <a href="">Forgot Password?</a>
                </div>
                <div className="mt-5 text-center xl:mt-8 xl:text-left">
                  <Button
                    variant="primary"
                    rounded
                    className={`bg-gradient-to-r from-theme-1/70 to-theme-2/70 w-full py-3.5 xl:mr-3 ${
                      !isAllValid() && "cursor-not-allowed opacity-50"
                    }`}
                    disabled={!isAllValid() || isSigning}
                    onClick={handleSignIn}
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
