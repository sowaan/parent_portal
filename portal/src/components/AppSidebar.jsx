import React, { useEffect, useState } from "react";

import {
  CCloseButton,
  CImage,
  CNavItem,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import sowaanLogo from "../assets/sowaan.png";
import { AppSidebarNav } from "./AppSidebarNav";
import { cibTodoist, cilDollar } from "@coreui/icons";

const AppSidebar = ({ sidebarShow, setSidebarShow }) => {
  const [unfoldable, setUnfoldable] = useState(false);
  const appData = JSON.parse(localStorage.getItem("appData"));

  return (
    <CSidebar
      className="border-end"
      colorScheme="light"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        setSidebarShow(visible);
      }}
    >
      <CSidebarHeader className="border-bottom justify-content-center">
        <CSidebarBrand to="/">
          {!unfoldable ? (
            <CImage
              customClassName="sidebar-brand-full"
              src={appData.app_logo ?? sowaanLogo}
              height={50}
            />
          ) : (
            <CImage
              customClassName="sidebar-brand-narrow"
              height={50}
              src={appData.banner_image ?? sowaanLogo}
            />
          )}
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => setSidebarShow(false)}
        />
      </CSidebarHeader>
      <AppSidebarNav
        items={[
          {
            component: CNavItem,
            name: "Fees",
            to: "/student-fee",
            icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Paid Fees",
            to: "/student-paid-fee",
            icon: <CIcon icon={cibTodoist} customClassName="nav-icon" />,
          },
        ]}
      />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => setUnfoldable(!unfoldable)} />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
