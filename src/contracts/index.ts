import CreateFacetAbi from "./CreateFacetAbi.json";
import GetterFacetAbi from "./GetterFacetAbi.json";
import AdminFacetAbi from "./AdminFacetAbi.json";
import RouterAbi from "./RouterAbi.json";
import SuperAdminFacetAbi from "./SuperAdminFacetAbi.json";

export const createFacetAbi = CreateFacetAbi;
export const getterFacetAbi = GetterFacetAbi;
export const routerAbi = RouterAbi;
export const adminFacetAbi = AdminFacetAbi;
export const superAdminFacetAbi = SuperAdminFacetAbi;

// export const diamondAddress = '0x4abdFE980aB243A2088e9D91D494839340E97d43';
// export const diamondAddress = '0xa17c2a04e086906C6385e9ACD4Ad6CccA2968d8D';
// export const diamondAddress = '0x22F8187A585876ED146B5c4D1A921818eEea04D5';
// export const diamondAddress = "0xdFEaB1E4b48e445096fAD0991b273fC5E56117d6";
// export const diamondAddress = "0x665aEA4030a83C7b199dEf0535308037668D2241";
// export const diamondAddress = "0xc892128042549a8BBb94D5491C349Ca816Bb1624";
// export const diamondAddress = "0x4D3d09169B8035668906Eb166977B30E085240c9";
// export const diamondAddress = "0x2E78cc903D4862e42943A7e6d9313435eeC121Da";
export const diamondAddress = "0x106B9ba4aBA4C3532075Af589eD68Ec32e47f159";
export const pancakeswapRouter = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
export const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
export const wbnbAddress = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
export const projectOwner = "0xec2B1547294a4dd62C0aE651aEb01493f8e4cD74";

// Old diamond address: 0x22F8187A585876ED146B5c4D1A921818eEea04D5

export const chainIdToAddress = {
  97: {
    diamondAddress: "0x665aEA4030a83C7b199dEf0535308037668D2241",
    pancakeswapRouter: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
    usdtAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
    wbnbAddress: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  },

  56: {
    diamondAddress: "",
    pancakeswapRouter: "",
    usdtAddress: "",
    wbnbAddress: "",
  },
};

export const SUPPORTED_CHAIN_ID = 97;

export const endInvestmentAbi = [
  {
    inputs: [],
    name: "AmountAboveMax",
    type: "error",
  },
  {
    inputs: [],
    name: "AmountBelowMin",
    type: "error",
  },
  {
    inputs: [],
    name: "EmptyArray",
    type: "error",
  },
  {
    inputs: [],
    name: "IndexOutOfBounds",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientInsuranceFee",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientPlatformTokenBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidDuration",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidValue",
    type: "error",
  },
  {
    inputs: [],
    name: "InvestmentAlreadyApproved",
    type: "error",
  },
  {
    inputs: [],
    name: "InvestmentAlreadyDisapproved",
    type: "error",
  },
  {
    inputs: [],
    name: "InvestmentNotActive",
    type: "error",
  },
  {
    inputs: [],
    name: "InvestmentNotApproved",
    type: "error",
  },
  {
    inputs: [],
    name: "NoInvestmentFound",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyCreator",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyOwnerCanCall",
    type: "error",
  },
  {
    inputs: [],
    name: "ProjectHasBeenCreated",
    type: "error",
  },
  {
    inputs: [],
    name: "ProjectNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "ReserveExceeded",
    type: "error",
  },
  {
    inputs: [],
    name: "UnequalLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "_investmentId",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "_projectId",
        type: "address",
      },
    ],
    name: "endInvestment",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
