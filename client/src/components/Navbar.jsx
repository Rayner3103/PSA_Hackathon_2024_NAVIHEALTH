import { NavLink } from "react-router-dom";
import psalogo from "../assets/psa_logo.png";
import teamlogo from "../assets/teamlogo.jpg"

const Links = [
    { name: "Solution1", link: "/" },
    { name: "Solution2", link: "/Solution2" },
];

export default function Navbar() {
    return (
        <div className = "shadow-md w-full p-1">
            <nav className="flex justify-center items-center mb-6">
                <div>
                    <NavLink to="/">
                        <img
                            alt="PSA"
                            className="h-10 inline"
                            src={psalogo}
                        ></img>
                    </NavLink>
                </div>
                <div  className={`md:flex md:items-center md:pb-0 pb-12 absolute md:static bg-white md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-300 ease-in ${
                        open ? "top-20 opacity-100" : "top-[-490px] opacity-0"
                    } md:opacity-100`} >
                <NavLink
                    className="md:ml-8 text-lg md:my-0 my-7"
                    to="/"
                >
                    SmartNavigator +
                </NavLink>

                <NavLink
                    className="md:ml-8 text-lg md:my-0 my-7"
                    to="/Solution2"
                >
                    SmartFleet
                </NavLink>
                </div>
            </nav>
        </div>
    );
}
