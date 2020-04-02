import React, { useState, useEffect, useCallback, useContext } from "react";
import { withRouter, Redirect } from "react-router";
import firebase from "../config/firebase";
import { AuthContext } from "../context/Auth.js";
import * as yup from 'yup';
import useYup from '@usereact/use-yup'


const validationSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required()
});

const Login = ({ history }) => {



  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')


  const { errors, validate } = useYup(values, validationSchema, {
    validateOnChange: false
  })

  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    return <Redirect to="/home" />;
  }
  // console.log('errors: ', errors)
  const handleChange = e => {
    const { name, value } = e.target

    validate();
    setValues({
      ...values,
      [name]: value
    });
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const { email, password } = values;
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      history.push("/");
    } catch (error) {
      // alert(error);
      console.error(error)
      setFormError('Sorry but we do not recognize that email/password combination. Please try again')
    }
  }

  return (

    <div class="flex flex-col p-3 bg-gray-300 items-center justify-center h-screen">

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/3">
        <p class="text-center text-gray-800 text-base font-bold text-xl">
          Login
        </p>

        <form class="" onSubmit={handleSubmit}>
          {formError && (
            <div class="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded relative" role="alert">
              <strong class="font-bold">Error!</strong>
              <span class="block sm:inline"> {formError}</span>
            </div>)}
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
              E-mail
            </label>
            <input name="email" value={values.email} onChange={e => handleChange(e)} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email" />
            {errors.email && (<p class="text-red-500 text-xs italic">{errors.email}</p>)}
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Password
            </label>
            <input name="password" value={values.password} onChange={e => handleChange(e)} class="shadow appearance-none border border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" />
            {/* <p class="text-red-500 text-xs italic">Please choose a password.</p> */}
            {errors.password && (<p class="text-red-500 text-xs italic">{errors.password}</p>)}
          </div>
          <div class="flex flex-col items-center justify-between">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mb-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Sign In
            </button>

            <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/forgotpassword">
              Forgot Password?
            </a>
          </div>
        </form>

      </div>

    </div>

  );
};

export default withRouter(Login);
