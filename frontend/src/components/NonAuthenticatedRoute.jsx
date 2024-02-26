import { useEffect, useState } from 'react'
import {useNavigate} from "react-router-dom"
import axios from "axios";

const NonAuthenticatedRoute = ({children}) => {
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();
  
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        setLoading(false);
        return;
      }
  
      try {
        await axios.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        navigate('/dashboard');
      } catch (error) {
        setLoading(false);
      }
    }
  
    useEffect(() => {
      verifyUser();
    },[])
  
    if (loading) return "Loading";
    return <>{children}</>
  }

export default NonAuthenticatedRoute
