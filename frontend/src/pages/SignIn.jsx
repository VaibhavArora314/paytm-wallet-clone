import { useState } from "react";
import Button from "../components/Button";
import BottomWarning from "../components/ButtonWarning";
import Heading from "../components/Heading";
import InputBox from "../components/InputBox";
import SubHeading from "../components/SubHeading";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import axios from "axios";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const inputs = [
    {
      label: "Email",
      placeholder: "emailaddress@gmail.com",
      onChange: (e) => {
        setUsername(e.target.value);
        setError("");
      },
      type: "email",
    },
    {
      label: "Password",
      placeholder: "123456",
      onChange: (e) => {
        setPassword(e.target.value);
        setError("");
      },
      type: "password",
    },
  ];

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/user/signin", {
        username,
        password
      })
      
      localStorage.setItem("token",response.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      const message = error.response.data.message;

      setError(message ? message : "An unexpected error occurred");
    }
  }

  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-96 text-center p-2 h-max px-4">
          <Heading label={"Sign in"} />
          <SubHeading label={"Enter your credentials to access your account"} />
          {inputs.map((input, index) => (
            <InputBox
              key={index}
              placeholder={input.placeholder}
              label={input.label}
              onChange={input.onChange}
              type={input.type}
            />
          ))}
          {error && <ErrorMessage label={error}/>}
          <div className="pt-4">
            <Button label={"Sign in"} onClick={handleSubmit}/>
          </div>
          <BottomWarning
            label={"Don't have an account?"}
            buttonText={"Sign up"}
            to={"/signup"}
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
