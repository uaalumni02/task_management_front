import React, { useState } from "react";
import "../static/login.css";

const ResetPassword = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [invalidReset, setInvalidReset] = useState("");

  const handleSubmit = (event) => {
    const url = window.location.pathname;
    const reset_token = url.substring(url.lastIndexOf("/") + 1);
    console.log(reset_token);
    event.preventDefault();
    fetch("http://localhost:3000/api/updatePassword/" + reset_token, {
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
        if (response.success == false) {
          setInvalidReset("**Please Enter Valid User Name and Password");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form">
          <h2>Reset Password</h2>

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
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" onClick={handleSubmit}>
            Reset
          </button>

          <div className="form-group">
            <a href="/" className="return-to-login-link">
              Return to Login
            </a>
          </div>
        </form>
        <h3>{invalidReset}</h3>
      </div>
      <div className="options-container"></div>
    </div>
  );
};

export default ResetPassword;
