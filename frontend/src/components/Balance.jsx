import { useEffect, useState } from "react"
import axios from "axios"

const Balance = () => {
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

    return <div className="flex">
        <div className="font-bold text-lg">
            Your balance
        </div>
        <div className="font-semibold ml-4 text-lg">
            Rs {balance}
        </div>
    </div>
}

export default Balance;