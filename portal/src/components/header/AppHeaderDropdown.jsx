import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import { cilLockLocked } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useFrappeAuth } from "frappe-react-sdk";
import { useNavigate } from "react-router-dom";

// import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = ({ user }) => {
  const navigate = useNavigate();
  const { currentUser, isLoading, logout, error } = useFrappeAuth();
  if (isLoading) return <div>loading...</div>;

  if (error) return <div>{error.message}</div>;

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0"
        caret={false}
      >
        <span className="mr-2 d-none d-lg-inline text-black-600 small"></span>
        <CAvatar size="md" color="primary" textColor="white">
          {user && user.first_name[0]}
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {user && user.full_name}
        </CDropdownHeader>
        <CDropdownDivider />
        <CDropdownItem
          style={{ cursor: "pointer" }}
          onClick={async () => {
            await logout();
            window.location.pathname = "/portal/parent-login";
          }}
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          Log Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
