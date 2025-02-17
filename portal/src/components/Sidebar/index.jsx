import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
// import SidebarLinkGroup from "./SidebarLinkGroup";
import sowaanLogo from "../../images/logo/sowaan.png";
import {
  IconAssignment,
  IconDashboard,
  IconDollar,
  IconDollaronHand,
  IconLeave,
  IconNewsLetter,
  IconProgress,
  IconRepository,
  IconTable,
} from "../../common/Icons";
import SidebarNavLink from "./SidebarNavLink";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const appData = JSON.parse(localStorage.getItem("appData"));
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img
            src={(appData ? appData.app_logo : null) ?? sowaanLogo}
            alt="Logo"
          />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="py-4 px-4 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item Dashboard --> */}
              <li>
                <SidebarNavLink
                  path="/"
                  active={
                    pathname === "/" ||
                    pathname === "/portal" ||
                    pathname.includes("dashboard")
                  }
                  icon={<IconDashboard />}
                  title="Dashboard"
                />
              </li>
              {/* <!-- Menu Item Dashboard --> */}

              {/* <!-- Menu Item Fees --> */}
              <li>
                <SidebarNavLink
                  path="/student-fee"
                  active={pathname.includes("student-fee")}
                  icon={<IconDollar />}
                  title="Fees"
                />
              </li>
              {/* <!-- Menu Item Fees --> */}

              {/* <!-- Menu Item Paid Fees --> */}
              <li>
                <SidebarNavLink
                  path="/student-paid-fee"
                  active={pathname.includes("student-paid-fee")}
                  icon={<IconDollaronHand />}
                  title="Paid Fees"
                />
              </li>
              {/* <!-- Menu Item Paid Fees --> */}
              {/* <!-- Menu Student Leave --> */}
              <li>
                <SidebarNavLink
                  path="/student-leave"
                  active={pathname.includes("student-leave")}
                  icon={<IconLeave />}
                  title="Student Leave"
                />
              </li>
              {/* <!-- Menu Student Leave --> */}
              {/* <!-- Menu News Letter --> */}
              <li>
                <SidebarNavLink
                  path="/newsletter"
                  active={pathname.includes("newsletter")}
                  icon={<IconNewsLetter />}
                  title="News Letter"
                />
              </li>
              {/* <!-- Menu Lecutre Repository --> */}
              <li>
                <SidebarNavLink
                  path="/lectures"
                  active={pathname.includes("lectures")}
                  icon={<IconRepository />}
                  title="Lecture Repository"
                />
              </li>
              {/* <!-- Menu Lecutre Repository --> */}
              <li>
                <SidebarNavLink
                  path="/timetable"
                  active={pathname.includes("timetable")}
                  icon={<IconTable />}
                  title="Timetable"
                />
              </li>
              {/* <!-- Menu Lecutre Repository --> */}
              {/* <!-- Menu Assignment --> */}
              <li>
                <SidebarNavLink
                  path="/assignment"
                  active={pathname.includes("assignment")}
                  icon={<IconAssignment />}
                  title="Assignment"
                />
              </li>
              {/* <!-- Menu Assignment --> */}
              {/* <!-- Menu Progress Report --> */}
              <li>
                <SidebarNavLink
                  path="/progress-report"
                  active={pathname.includes("progress-report")}
                  icon={<IconProgress />}
                  title="Progress Report"
                />
              </li>
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
