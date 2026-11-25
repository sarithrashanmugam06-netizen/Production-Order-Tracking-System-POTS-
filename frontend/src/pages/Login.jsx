import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { loginUser } from "../services/authService";

import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const session = await loginUser(email, password);

      login(session);
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error, "Sign in failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo-mark">P</div>

          <div>
            <h1>POTS</h1>
            <span>Production Order Tracking System</span>
          </div>
        </div>

        <h2>Welcome back</h2>
        <p className="login-subtitle">Sign in to continue</p>

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>

            <Form.Control
              type="email"
              placeholder="you@company.com"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>

            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Check
            className="mb-4"
            type="checkbox"
            id="show-password"
            label="Show password"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />

          <Button type="submit" className="w-100 py-2" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Login;
