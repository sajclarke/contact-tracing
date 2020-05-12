import React, { useCallback } from "react";
import { withRouter } from "react-router";
import firebase from "../config/firebase";

const SignUp = ({ history }) => {
  const handleSignUp = useCallback(async event => {
    event.preventDefault();
    const { email, password } = event.target.elements;
    try {
      await firebase
        .auth()
        .createUserWithEmailAndPassword(email.value, password.value);
      history.push("/");
    } catch (error) {
      alert(error);
    }
  }, [history]);

  return (
    // <div>
    //   <h1>Sign up</h1>
    //   <form onSubmit={handleSignUp}>
    //     <label>
    //       Email
    //       <input name="email" type="email" placeholder="Email" />
    //     </label>
    //     <label>
    //       Password
    //       <input name="password" type="password" placeholder="Password" />
    //     </label>
    //     <button type="submit">Sign Up</button>
    //   </form>
    // </div>
    <div className="flex items-center justify-center h-screen">

      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSignUp}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" for="username">
            Username
            </label>
          <input name="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" for="password">
            Password
            </label>
          <input name="password" className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" />
          <p className="text-red-500 text-xs italic">Please choose a password.</p>
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Sign In
            </button>
          <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/forgotpassword">
            Forgot Password?
            </a>
        </div>
      </form>

    </div>
  );
};

export default withRouter(SignUp);
