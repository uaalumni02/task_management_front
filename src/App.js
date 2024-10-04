import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>

      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
