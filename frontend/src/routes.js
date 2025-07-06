import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import Stations from "layouts/stations";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ProtectedRoute from "components/ProtectedRoute";

// Vision UI Dashboard React icons
import { IoRocketSharp } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";
import { BsFillPersonFill } from "react-icons/bs";
import { IoBuild } from "react-icons/io5";
import { BsCreditCardFill, BsCarFrontFill  } from "react-icons/bs";
import { IoStatsChart } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { IoLogOut } from "react-icons/io5";

const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  // Trigger a custom event to notify other components
  window.dispatchEvent(new Event('storage'));
  window.location.href = '/authentication/sign-in';
};

const getRoutes = (isAuthenticated) => {
  return [
    // Show protected routes only when authenticated
    ...(isAuthenticated ? [
      {
        type: "collapse",
        name: "Dashboard",
        key: "dashboard",
        route: "/dashboard",
        icon: <IoHome size="15px" color="inherit" />,
        component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Billing",
        key: "billing",
        route: "/billing",
        icon: <BsCreditCardFill size="15px" color="inherit" />,
        component: () => (
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        ),
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Stations",
        key: "stations",
        route: "/stations",
        icon: <BsCarFrontFill  size="15px" color="inherit" />,
        component: () => (
          <ProtectedRoute>
            <Stations />
          </ProtectedRoute>
        ),
        noCollapse: true,
      },
      { type: "title", title: "Account Pages", key: "account-pages" },
      {
        type: "collapse",
        name: "Profile",
        key: "profile",
        route: "/profile",
        icon: <BsFillPersonFill size="15px" color="inherit" />,
        component: () => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Log Out",
        key: "logout",
        route: "#",
        icon: <IoLogOut size="15px" color="inherit" />,
        component: () => null,
        onClick: handleLogout,
        noCollapse: true,
      },
    ] : []),
    
    // Show auth routes only when NOT authenticated
    ...(!isAuthenticated ? [
      {
        type: "collapse",
        name: "Sign In",
        key: "sign-in",
        route: "/authentication/sign-in",
        icon: <IoIosDocument size="15px" color="inherit" />,
        component: SignIn,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Sign Up",
        key: "sign-up",
        route: "/authentication/sign-up",
        icon: <IoRocketSharp size="15px" color="inherit" />,
        component: SignUp,
        noCollapse: true,
      },
    ] : []),
  ];
};

export default getRoutes;
