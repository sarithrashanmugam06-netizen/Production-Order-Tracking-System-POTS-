import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ProductProvider } from "./context/ProductContext";
import { AuthProvider } from "./context/AuthContext";
import { WorkOrderProvider } from "./context/WorkOrderContext";

// Design system last, so it wins over Bootstrap and the per-page stylesheets.
import "./styles/theme.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductProvider>
        <WorkOrderProvider>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            pauseOnFocusLoss
            theme="light"
            limit={3}
          />
        </WorkOrderProvider>
      </ProductProvider>
    </AuthProvider>
  </React.StrictMode>
);