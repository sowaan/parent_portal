/* eslint-disable react/prop-types */
import React, { useState } from "react";

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
import sowaanLogo from "../images/logo/sowaan.png";
import { AppSidebarNav } from "./AppSidebarNav";
import {
  cibSlickpic,
  cilAvTimer,
  cilChart,
  cilCheck,
  cilDisabled,
  cilDollar,
  cilFile,
  cilFolderOpen,
  cilHistory,
  cilNewspaper,
} from "@coreui/icons";

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
              className="sidebar-brand-full"
              src={appData.app_logo ?? sowaanLogo}
              height={50}
            />
          ) : (
            <CImage
              className="sidebar-brand-narrow"
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
            name: "Attendance",
            to: "/",
            icon: <CIcon icon={cilChart} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Fees",
            to: "/student-fee",
            icon: <CIcon icon={cilDollar} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Paid Fees",
            to: "/student-paid-fee",
            icon: <CIcon icon={cilCheck} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Lecutre Repository",
            to: "/lectures",
            icon: <CIcon icon={cilFile} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Timetable",
            to: "/timetable",
            icon: <CIcon icon={cilAvTimer} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Assignment",
            to: "/assignment",
            icon: <CIcon icon={cilFolderOpen} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Newsletter",
            to: "/newsletter",
            icon: <CIcon icon={cilNewspaper} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Progress Report",
            to: "/progress-report",
            icon: <CIcon icon={cilHistory} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Student Leave",
            to: "/student-leave",
            icon: <CIcon icon={cilDisabled} className="nav-icon" />,
          },
          {
            component: CNavItem,
            name: "Gallery",
            to: "/gallery",
            icon: <CIcon icon={cibSlickpic} className="nav-icon" />,
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
