import { useEffect, useState } from "react"
import Button from "./Button"
import { useNavigate } from "react-router-dom";
import axios from "axios"

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    let timeoutValue = null;

    const getUsers = async () => {
        try {
            const response = await await axios.get("/user/bulk?filter=" + filter, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            setUsers(response.data.users || []);
        } catch (error) {
            setUsers([]);
        }
    }

    useEffect(() => {
        getUsers();
    },[filter]);

    return <>
        <div className="font-bold mt-6 text-lg">
            Users
        </div>
        <div className="my-2">
            <input onChange={(e) => {
                if (timeoutValue) clearTimeout(timeoutValue);

                timeoutValue = setTimeout(() => {
                    setFilter(e.target.value)
                },500);
            }} type="text" placeholder="Search users first or last name..." className="w-full px-2 py-1 border rounded border-slate-200"></input>
        </div>
        <div>
            {users.map(user => <User key={user._id} user={user} />)}
            {!users && <p>No existing user</p>}
        </div>
    </>
}

function User({user}) {
    const navigate = useNavigate();

    return <div className="flex justify-between mb-2">
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user.firstName[0]}
                </div>
            </div>
            <div className="flex flex-col justify-center h-ful">
                <div>
                    {user.firstName} {user.lastName}
                </div>
            </div>
        </div>

        <div className="flex flex-col justify-center h-ful">
            <Button onClick={() => {
                navigate("/send/" + user._id + "?name=" + user.firstName + "" + user.lastName);
            }} label={"Send Money"} />
        </div>
    </div>
}

export default Users;