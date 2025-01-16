import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

const Wrapper = ({ children, sidebarShow, setSidebarShow }) => {
  return (
    <div>
      <AppSidebar sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
        {children}
      </div>
    </div>
  );
};

export default Wrapper;
