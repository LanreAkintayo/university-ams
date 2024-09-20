import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { string } from "yup";

export type NextPageWithLayout<P = {}, Q = {}> = NextPage<P & Q> & {
  authorization?: boolean;
  getLayout?: (page: ReactElement) => ReactNode;
};

export type Product = {
  tagId: string;
  name: string;
  status: string;
  imageUrl: string;
  description: string;
  allocatedTo: string;
  category: string;
};


export type Error = {
  cause?: unknown;
  message: string;
  name: string;
  stack?: string | undefined;
};
