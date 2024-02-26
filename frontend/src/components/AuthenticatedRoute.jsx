import { useEffect, useState } from 'react'
import {useNavigate} from "react-router-dom"
import axios from "axios";

const AuthenticatedRoute = ({children}) => {
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();
  
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
  
      try {
        await axios.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        setLoading(false);
      } catch (error) {
        localStorage.removeItem("token");
        navigate('/signin');
      }
    }
  
    useEffect(() => {
      verifyUser();
    },[])
  
    if (loading) return "Loading";
    return <>{children}</>
  }

export default AuthenticatedRoute
