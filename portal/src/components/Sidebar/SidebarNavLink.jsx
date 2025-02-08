import { NavLink } from "react-router-dom";

function SidebarNavLink({ path, active, icon, title }) {
  return (
    <NavLink
      to={path}
      className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
        active && "bg-graydark dark:bg-meta-4"
      }`}
    >
      {icon}
      {title}
    </NavLink>
  );
}

export default SidebarNavLink;
