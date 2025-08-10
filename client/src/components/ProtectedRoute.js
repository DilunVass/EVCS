// filepath: d:\ICIEOS\EVCS\frontend2\src\components\ProtectedRoute.js
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const history = useHistory();
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      // No token found, redirect to sign in
      history.push('/authentication/sign-in');
      return;
    }
    
    // Optional: Verify token validity with backend
    // You can add token expiration check here
  }, [history]);
  
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return null; // Don't render anything while redirecting
  }
  
  return children;
};

export default ProtectedRoute;