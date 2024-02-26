import Appbar from "../components/Appbar"
import Balance from "../components/Balance"
import TransactionHistory from "../components/TransactionHistory"
import Users from "../components/Users"

const Dashboard = () => {
    return <div>
        <Appbar />
        <div className="m-8">
            <Balance />
            <Users />
            <TransactionHistory />
        </div>
    </div>
}

export default Dashboard;