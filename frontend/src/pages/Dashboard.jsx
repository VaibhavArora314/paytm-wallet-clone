import { useEffect, useState } from "react"
import Appbar from "../components/Appbar"
import Balance from "../components/Balance"
import Users from "../components/Users"
import axios from "axios"

const Dashboard = () => {
    const [balance,setBalance] = useState(0);

    const fetchBalance = async () => {
        try {
            const {data} = await axios.get('/account/balance', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            setBalance(data.balance);
        } catch (error) {
            setBalance(0);
        }
    }

    useEffect(() => {
        fetchBalance();
        
        const interval = setInterval(fetchBalance,5*1000);
        return () => {clearInterval(interval)};
    },[])

    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={balance} />
            <Users />
        </div>
    </div>
}

export default Dashboard;