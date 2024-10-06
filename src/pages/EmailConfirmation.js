import React, { useState } from "react";
import "../static/login.css";

const EmailConfirmation = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
        Please Check Your Email for Reset Information or Click the Link Below to
        Return Home
      </h1>

      <a
        href="/"
        className="return-to-login-link"
        style={{
          marginTop: "20px",
          fontSize: "50px",
          textDecoration: "none",
          color: "#007bff",
        }}
      >
        Return to Login
      </a>
    </div>
  );
};

export default EmailConfirmation;
