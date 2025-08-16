import React, { useEffect } from "react";
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

// Logout function
export const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  window.location.href = '/authentication/sign-in';
};

// Check if user is logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

// Create a simple logout component
const LogoutComponent = () => {
  useEffect(() => {
    handleLogout();
  }, []);
  return null;
};

// Dynamic routes function
export const getRoutes = () => {
  const baseRoutes = [
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
      name: "Tables",
      key: "tables",
      route: "/tables",
      icon: <IoStatsChart size="15px" color="inherit" />,
      component: () => (
        <ProtectedRoute>
          <Tables />
        </ProtectedRoute>
      ),
      noCollapse: true,
    },
    // {
    //   type: "collapse",
    //   name: "Billing",
    //   key: "billing",
    //   route: "/billing",
    //   icon: <BsCreditCardFill size="15px" color="inherit" />,
    //   component: () => (
    //     <ProtectedRoute>
    //       <Billing />
    //     </ProtectedRoute>
    //   ),
    //   noCollapse: true,
    // },
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
  ];

  // Add authentication routes based on login status
  if (isAuthenticated()) {
    baseRoutes.push({
      type: "collapse",
      name: "Logout",
      key: "logout",
      route: "/logout",
      icon: <IoLogOut size="15px" color="inherit" />,
      component: LogoutComponent,
      noCollapse: true,
    });
  } else {
    baseRoutes.push(
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
      }
    );
  }

  return baseRoutes;
};

// Default export for backward compatibility
const routes = getRoutes();
export default routes;
