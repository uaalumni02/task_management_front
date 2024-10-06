import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../static/login.css";

const ResetPassword = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidReset, setInvalidReset] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if passwords match before submitting
    if (password !== confirmPassword) {
      setInvalidReset("**Passwords do not match");
      return;
    }

    const url = window.location.pathname;
    const reset_token = url.substring(url.lastIndexOf("/") + 1);
    console.log(reset_token);

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
        if (response.success === false) {
          setInvalidReset("**Please Enter Valid User Name and Password");
        } else if (response.success === true) {
          // If response is successful, redirect to login page
          navigate("/");
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
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
