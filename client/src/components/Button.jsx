import React from "react";

const Button = (props) => {
    return (
        <div>
            <button className="bg-indigo-600 text-white text-lg font-sans py-2 px-6 rounded-md md:ml-8 hover:bg-indigo-400 duration-500">
                {props.children}
            </button>
        </div>
    );
};

export default Button;
