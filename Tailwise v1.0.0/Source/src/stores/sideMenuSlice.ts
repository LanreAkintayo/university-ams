import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { icons } from "../base-components/Lucide";

export interface Menu {
  icon: keyof typeof icons;
  title: string;
  badge?: number;
  pathname?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface SideMenuState {
  menu: Array<Menu | string>;
}

const initialState: SideMenuState = {
  menu: [
    "DASHBOARDS",
    {
      icon: "FileCheck2",
      pathname: "/",
      title: "E-Commerce",
    },
    {
      icon: "FileCheck2",
      pathname: "/dashboard-overview-2",
      title: "CRM",
    },
    {
      icon: "FileCheck2",
      pathname: "/dashboard-overview-3",
      title: "Hospital",
    },
    {
      icon: "FileCheck2",
      pathname: "/dashboard-overview-4",
      title: "Factory",
    },
    {
      icon: "FileCheck2",
      pathname: "/dashboard-overview-5",
      title: "Banking",
    },
    {
      icon: "FileCheck2",
      pathname: "/dashboard-overview-6",
      title: "Cafe",
    },
    {
      icon: "FileCheck2",
      pathname: "/dashboard-overview-7",
      title: "Crypto",
    },
    {
      icon: "FileCheck2",
      pathname: "/dashboard-overview-8",
      title: "Hotel",
    },
    "USER MANAGEMENT",
    {
      icon: "FileCheck2",
      pathname: "/users",
      title: "Users",
    },
    {
      icon: "FileCheck2",
      pathname: "/departments",
      title: "Departments",
    },
    {
      icon: "FileCheck2",
      pathname: "/add-user",
      title: "Add User",
    },
    "PERSONAL DASHBOARD",
    {
      icon: "FileCheck2",
      pathname: "/profile-overview",
      title: "Profile Overview",
    },
    {
      icon: "FileCheck2",
      pathname: "/profile-overview?page=events",
      title: "Events",
    },
    {
      icon: "FileCheck2",
      pathname: "/profile-overview?page=achievements",
      title: "Achievements",
    },
    {
      icon: "FileCheck2",
      pathname: "/profile-overview?page=contacts",
      title: "Contacts",
    },
    {
      icon: "FileCheck2",
      pathname: "/profile-overview?page=default",
      title: "Default",
    },
    "GENERAL SETTINGS",
    {
      icon: "FileCheck2",
      pathname: "/settings",
      title: "Profile Info",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=email-settings",
      title: "Email Settings",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=security",
      title: "Security",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=preferences",
      title: "Preferences",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=two-factor-authentication",
      title: "Two-factor Authentication",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=device-history",
      title: "Device History",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=notification-settings",
      title: "Notification Settings",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=connected-services",
      title: "Connected Services",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=social-media-links",
      title: "Social Media Links",
    },
    {
      icon: "FileCheck2",
      pathname: "/settings?page=account-deactivation",
      title: "Account Deactivation",
    },
    "ACCOUNT",
    {
      icon: "FileCheck2",
      pathname: "/billing",
      title: "Billing",
    },
    {
      icon: "FileCheck2",
      pathname: "/invoice",
      title: "Invoice",
    },
    "E-COMMERCE",
    {
      icon: "FileCheck2",
      pathname: "/categories",
      title: "Categories",
    },
    {
      icon: "FileCheck2",
      pathname: "/add-product",
      title: "Add Product",
    },
    {
      icon: "FileCheck2",
      pathname: "/products",
      title: "Products",
      subMenu: [
        {
          icon: "FileCheck2",
          pathname: "/product-list",
          title: "Product List",
        },
        {
          icon: "FileCheck2",
          pathname: "/product-grid",
          title: "Product Grid",
        },
      ],
    },
    {
      icon: "FileCheck2",
      pathname: "/transactions",
      title: "Transactions",
      subMenu: [
        {
          icon: "FileCheck2",
          pathname: "/transaction-list",
          title: "Transaction List",
        },
        {
          icon: "FileCheck2",
          pathname: "/transaction-detail",
          title: "Transaction Detail",
        },
      ],
    },
    {
      icon: "FileCheck2",
      pathname: "/sellers",
      title: "Sellers",
      subMenu: [
        {
          icon: "FileCheck2",
          pathname: "/seller-list",
          title: "Seller List",
        },
        {
          icon: "FileCheck2",
          pathname: "/seller-detail",
          title: "Seller Detail",
        },
      ],
    },
    {
      icon: "FileCheck2",
      pathname: "/reviews",
      title: "Reviews",
    },
    "APPS",
    {
      icon: "Inbox",
      pathname: "/inbox",
      title: "Inbox",
      badge: 4,
    },
    {
      icon: "HardDrive",
      title: "File Manager",
      subMenu: [
        {
          icon: "FileCheck2",
          pathname: "/file-manager-list",
          title: "List View",
        },
        {
          icon: "FileCheck2",
          pathname: "/file-manager-grid",
          title: "Grid View",
        },
      ],
    },
    {
      icon: "CreditCard",
      pathname: "/point-of-sale",
      title: "Point of Sale",
    },
    "AUTHENTICATIONS",
    {
      icon: "FileCheck2",
      pathname: "login",
      title: "Login",
    },
    {
      icon: "FileCheck2",
      pathname: "register",
      title: "Register",
    },
    "COMPONENTS",
    {
      icon: "FileCheck2",
      title: "Table",
      subMenu: [
        {
          icon: "FileCode2",
          pathname: "/regular-table",
          title: "Regular Table",
        },
        {
          icon: "FileCode2",
          pathname: "/tabulator",
          title: "Tabulator",
        },
      ],
    },
    {
      icon: "FileCheck2",
      title: "Overlay",
      subMenu: [
        {
          icon: "FileCode2",
          pathname: "/modal",
          title: "Modal",
        },
        {
          icon: "FileCode2",
          pathname: "/slideover",
          title: "Slide Over",
        },
        {
          icon: "FileCode2",
          pathname: "/notification",
          title: "Notification",
        },
      ],
    },
    {
      icon: "FileCheck2",
      pathname: "/tab",
      title: "Tab",
    },
    {
      icon: "FileCheck2",
      pathname: "/accordion",
      title: "Accordion",
    },
    {
      icon: "FileCheck2",
      pathname: "/button",
      title: "Button",
    },
    {
      icon: "FileCheck2",
      pathname: "/alert",
      title: "Alert",
    },
    {
      icon: "FileCheck2",
      pathname: "/progress-bar",
      title: "Progress Bar",
    },
    {
      icon: "FileCheck2",
      pathname: "/tooltip",
      title: "Tooltip",
    },
    {
      icon: "FileCheck2",
      pathname: "/dropdown",
      title: "Dropdown",
    },
    {
      icon: "FileCheck2",
      pathname: "/typography",
      title: "Typography",
    },
    {
      icon: "FileCheck2",
      pathname: "/icon",
      title: "Icon",
    },
    {
      icon: "FileCheck2",
      pathname: "/loading-icon",
      title: "Loading Icon",
    },
    {
      icon: "FileCheck2",
      pathname: "/regular-form",
      title: "Regular Form",
    },
    {
      icon: "FileCheck2",
      pathname: "/datepicker",
      title: "Datepicker",
    },
    {
      icon: "FileCheck2",
      pathname: "/tom-select",
      title: "Tom Select",
    },
    {
      icon: "FileCheck2",
      pathname: "/file-upload",
      title: "File Upload",
    },
    {
      icon: "FileCheck2",
      pathname: "/wysiwyg-editor",
      title: "Wysiwyg Editor",
    },
    {
      icon: "FileCheck2",
      pathname: "/validation",
      title: "Validation",
    },
    {
      icon: "FileCheck2",
      pathname: "/chart",
      title: "Chart",
    },
    {
      icon: "FileCheck2",
      pathname: "/slider",
      title: "Slider",
    },
    {
      icon: "FileCheck2",
      pathname: "/image-zoom",
      title: "Image Zoom",
    },
  ],
};

export const sideMenuSlice = createSlice({
  name: "sideMenu",
  initialState,
  reducers: {},
});

export const selectSideMenu = (state: RootState) => state.sideMenu.menu;

export default sideMenuSlice.reducer;
