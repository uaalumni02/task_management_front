import React, { useState } from "react";
import "../static/login.css";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [invalidRegister, setInvalidRegister] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("http://localhost:3000/api/user", {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        password,
        email,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        if (response.success == false) {
          setInvalidRegister("**Invalid Registration");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form">
          <h2>Please Register</h2>

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
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" onClick={handleSubmit}>
            Register
          </button>
        </form>
        <h3>{invalidRegister}</h3>
      </div>

      <div className="options-container">
        <div className="card">
          <a href="#" className="forgot-password-link">
            Forgot Password?
          </a>
        </div>
        {/* New "Return to Login" card */}
        <div className="card">
          <a href="/" className="return-to-login-link">
            Return to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
