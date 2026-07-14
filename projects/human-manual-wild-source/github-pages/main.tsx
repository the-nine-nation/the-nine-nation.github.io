import React from "react";
import ReactDOM from "react-dom/client";
import { PagesApp } from "./PagesApp";
import "../app/globals.css";
import "./pages.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><PagesApp /></React.StrictMode>,
);
