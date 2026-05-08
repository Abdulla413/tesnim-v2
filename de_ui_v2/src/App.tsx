// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
     <>
      <Router>
        <Header />
        {/* Add top padding to prevent overlap with fixed header */}
        <div className="container mx-auto px-4 pt-15">
          <AppRoutes />
        </div>
      </Router>
      <ToastContainer />
    </>
  );
};

export default App;
