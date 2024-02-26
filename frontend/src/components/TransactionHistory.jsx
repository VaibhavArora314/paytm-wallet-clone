import axios from "axios";
import { useEffect, useState } from "react";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/account/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTransactions(response.data.history);
    } catch (error) {
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <>
      <div className="font-bold mt-6 text-lg mb-2">History</div>
      {transactions.length == 0 && (
        <div className="font-medium mt-4 text-md">No transaction done yet</div>
      )}
      {transactions.map((transaction) => (
        <TransactionElement transaction={transaction} key={transaction._id} />
      ))}
    </>
  );
};

const TransactionElement = ({ transaction }) => {
  return (
    <div className="mb-4 py-2 px-5 rounded-lg shadow-lg border border-gray-100 flex-col">
      <div className="flex justify-between">
        <div className="flex text-md">
          {transaction.type == "Debit" && (
            <>
              {/* Sent to{"  "} */}
              <p className="font-semibold">
                {transaction.receiver.firstName} {transaction.receiver.lastName}
              </p>
            </>
          )}
          {transaction.type == "Credit" &&
            <>
            {/* Received from{" "} */}
            <p className="font-semibold">
              {transaction.sender.firstName} {transaction.sender.lastName}
            </p>
          </>}
        </div>

        {transaction.type == "Debit" && (
          <div className="text-red-500 text-lg font-semibold">
            - {transaction.transferAmount} Rs
          </div>
        )}
        {transaction.type == "Credit" && (
          <div className="text-green-500 text-lg font-semibold">
            + {transaction.transferAmount} Rs
          </div>
        )}
      </div>
      <div>{transaction.date.slice(0, 10)} {transaction.date.slice(11, 16)}</div>
    </div>
  );
};

export default TransactionHistory;
