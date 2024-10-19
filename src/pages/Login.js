import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import "../static/login.css";

//----example of how to access cookies for routes that are secured

// fetch("http://localhost:3000/api/protected-route", {
//   method: "GET",
//   credentials: "include", // Ensures cookies are sent with the request
// })
//   .then((res) => res.json())
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => console.error("Error:", error));

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [InvalidLogin, setInvalidLogin] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");

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
        console.log(response.user._id);
        if (response.success == false) {
          setInvalidLogin("**Invalid Credentials");
        } else {
          setLoggedIn(true);
          setUserId(response.user._id)
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="login-page">
       {loggedIn ? <Navigate to={`/dashboard/${userId}`} /> : ""}
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
        <h3>{InvalidLogin}</h3>
      </div>
      <div className="options-container">
        <div className="card">
          <a href="/Request_Token" className="forgot-password-link">
            Forgot Password?
          </a>
        </div>
        <div className="card">
          <p>New to the site?</p>
          <a href="/register" className="signup-link">
            Create an Account!
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
