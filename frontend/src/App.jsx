import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SendMoney from "./pages/SendMoney";
import Dashboard from "./pages/Dashboard";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import NonAuthenticatedRoute from "./components/NonAuthenticatedRoute";
import axios from "axios";
import TransactionDetail from "./pages/TransactionDetail";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/signin"
            element={
              <NonAuthenticatedRoute>
                <SignIn />
              </NonAuthenticatedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <NonAuthenticatedRoute>
                <SignUp />
              </NonAuthenticatedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthenticatedRoute>
                <Dashboard />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/send/:id"
            element={
              <AuthenticatedRoute>
                <SendMoney />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/transaction/:id"
            element={
              <AuthenticatedRoute>
                <TransactionDetail />
              </AuthenticatedRoute>
            }
          />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
