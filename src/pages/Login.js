import React, { useState } from "react";
import "../static/login.css";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("http://localhost:3000/api/user/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        password,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form">
          <h2>Log Into Task Manager</h2>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" onClick={handleSubmit}>
            Login
          </button>
        </form>
      </div>

      <div className="options-container">
        <div className="card">
          <a href="#" className="forgot-password-link">
            Forgot Password?
          </a>
        </div>
        <div className="card">
          <p>New to the site?</p>
          <a href="#" className="signup-link">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
