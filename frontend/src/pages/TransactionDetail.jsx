import axios from "axios";
import { useEffect, useState,  } from "react";
import { useParams } from "react-router-dom";
import TransactionCard from "../components/TransactionCard";

const TransactionDetail = () => {
  const {id} = useParams();
  const [message,setMessage] = useState("");
  const [transaction,setTransaction] = useState({});

  const fetchTransactionDetails = async () => {
    try {
      const response = await axios.get('/account/history/'+id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setTransaction(response.data.transaction);
    } catch (error) {
      setMessage(error.response.data.message);
    }
  }

  useEffect(() => {
    fetchTransactionDetails();
  }, [])

  if (!transaction || !transaction._id) return <TransactionCard heading="Payment Status" message={message} error/>

  console.log(transaction);

  return <TransactionCard heading="Payment Status" message={
    `${transaction.sender.firstName} ${transaction.sender.lastName} sent ${transaction.transferAmount} to ${transaction.receiver.firstName} ${transaction.receiver.lastName} on ${transaction.date.slice(0,10)}`
  } />;
};

export default TransactionDetail;
