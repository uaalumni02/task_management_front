import React, { useState } from "react";
import "../static/login.css";

const RequestToken = () => {
  const [email, setEmail] = useState("");
  const [invalidReset, setInvalidReset] = useState("");
  const [validReset, setValidReset] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("http://localhost:3000/api/reset", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        if(response.success == false) {
          setInvalidReset("**Enter Valid Email");
        } 
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form">
          <h2>Enter Email Address for Reset Link</h2>
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
            Send Link
          </button>
        </form>
        <h3>{invalidReset}</h3>
      </div>

      <div className="options-container">
        <div className="card">
          <a href="/" className="return-to-login-link">
            Return to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default RequestToken;
