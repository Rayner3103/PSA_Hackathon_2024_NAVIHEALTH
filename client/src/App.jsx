import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Nav from "./components/Nav";
const App = () => {
  return (
    <div className="w-full pt-4">
      <Navbar />
      <Outlet />
    </div>
  );
};
export default App
