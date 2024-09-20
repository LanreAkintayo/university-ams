import { EtherSymbol, ethers } from "ethers";
import { useEffect, useState } from "react";
import { LiquidityProviders, Metrics, ProjectInfo } from "../../types/general";
import {
  getLiquidityProviders,
  getProjectInfo,
  getProjectMetrics,
  loadLiquidityProviders,
  loadProjectInfo,
  loadProjectMetrics,
} from "../../stores/insuranceSlice";
import { Link } from "react-router-dom";
import { IDetailedProject } from "../../pages/Home";
import { inDollarFormat } from "../../utils/helper";
import Lucide from "../../base-components/Lucide";
import { Award, Banknote, CircleDollarSign } from "lucide-react";

interface IHomeProject {
  project: IDetailedProject;
}
export default function HomeProject({ project }: IHomeProject) {
  let [liquidityProviders, setLiquidityProviders] =
    useState<LiquidityProviders[]>();
  let [projectMetrics, setProjectMetrics] = useState<Metrics>();
  let [projectInfo, setProjectInfo] = useState<ProjectInfo>();

  let [totalStableLiquidity, setTotalStableLiquidity] = useState<bigint>();

  useEffect(() => {
    const fetchLiquidityProviders = async () => {
      const liquidityProviders = await getLiquidityProviders(
        project.projectAddress
      );

      const projectMetrics = await getProjectMetrics(project.projectAddress);
      const projectInfo = await getProjectInfo(project.projectAddress);

      if (projectMetrics) {
        setProjectMetrics(projectMetrics);
      }
      if (projectInfo) {
        setProjectInfo(projectInfo);
      }

      if (liquidityProviders) {
        const totalStableLiquidity = liquidityProviders.reduce(
          (accumulator, currentLiquidityProvider) =>
            accumulator + currentLiquidityProvider.stableAmount,
          0n
        );
        setTotalStableLiquidity(totalStableLiquidity);
        setLiquidityProviders(liquidityProviders);
      }
    };
    fetchLiquidityProviders();
  }, [project]);

  console.log("Total stable liquidity: ", totalStableLiquidity);
  console.log(
    "Total number of liquidity providers: ",
    liquidityProviders?.length
  );
  return (
    <div className="p-6 w-[450px] mb-12 rounded-xl border-slate shadow-md border ">
      <div className="flex flex-col items-center justify-center mt-8">
        <img
          alt={project.name}
          src={projectInfo?.logo}
          width={60}
          height={60}
          className="mb-3 rounded-full"
        />
        <p className="text-3xl text-theme-1/80 font-semibold">{project.name}</p>
      </div>

      <div className="text-lg mt-6">
        <div className="flex justify-between border-b border-gray-300 py-4">
          <div className="flex space-x-2">
            <Award />
            <p className="text-[18px]">Sponsors</p>
          </div>

          <p className="font-medium">{liquidityProviders?.length}</p>
        </div>
        <div className="flex justify-between border-b border-gray-300 py-4">
          <div className="flex space-x-2">
            <Banknote />
            <p className="text-[18px]">Total {project.symbol} in the reserve</p>
          </div>
          <p className="font-medium">
            {projectMetrics
              ? inDollarFormat(
                  Number(
                    ethers.formatUnits(
                      projectMetrics?.investmentReserveBalance,
                      project.decimals
                    )
                  )
                )
              : "--"}{" "}
            {project.symbol}
          </p>
        </div>
        <div className="flex justify-between border-b border-gray-300 py-4">
          <div className="flex space-x-2">
            <CircleDollarSign />
            <p className="text-[18px]">Total USDT in the reserve</p>
          </div>

          <p className="font-medium">
            {projectMetrics
              ? inDollarFormat(
                  Number(
                    ethers.formatUnits(projectMetrics?.stableReserveBalance, 18)
                  )
                )
              : "--"}{" "}
            USDT
          </p>
        </div>
      </div>

      <div className="mt-6 bg-theme-1/80 text-white rounded-full hover:scale-105">
        <Link to={`/project/${project.projectAddress}`}>
          <div className="text-center  mx-5 py-3 px-4 text-xl rounded-full ">
            <p>Visit Protocol</p>
          </div>
        </Link>
      </div>

      {/* <div className="mt-6 bg-theme-2 text-white rounded-full ">
        <Link to={`https://web.telegram.org/a/#-1933316011`}>
          <div className="text-center bg-gradient-to-b from-transparent to-theme-2/[0.04] mx-5  border border-theme-2 py-3 px-4 text-xl rounded-full">
            <p>Visit Protocol</p>
          </div>
        </Link>
      </div> */}

      <div className="flex items-center justify-center">
        <div className="inline-flex items-center justify-center mt-4 mb-6 space-x-4 border border-slate-300 py-3 rounded-full p-5">
          <div className="">
            <a
              href="https://web.telegram.org/a/#-1933316011"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`/telegram.svg`}
                alt="Telegram Logo"
                className="h-8 w-8" // Adjust the height and width as needed
              />
            </a>
          </div>
          <div className="">
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`/x.svg`}
                alt="X Logo"
                className="h-8 w-8" // Adjust the height and width as needed
              />
            </a>
          </div>
          <div className="">
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`/discord.svg`}
                alt="Discord Logo"
                className="h-8 w-8" // Adjust the height and width as needed
              />
            </a>
          </div>
          <div className="">
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Lucide icon="Globe" className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
