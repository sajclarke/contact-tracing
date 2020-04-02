import React, { useState, useCallback } from "react";
import { withRouter } from "react-router";
import app from "../config/firebase.js";
import { AuthContext } from "../context/Auth.js";

import * as yup from 'yup';
import useYup from '@usereact/use-yup'


const validationSchema = yup.object().shape({
    email: yup.string().email().required(),
    // password: yup.string().min(6).required()
});

const ForgotPassword = ({ history }) => {

    const [values, setValues] = useState({
        email: '',
        // password: '',
    })
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    const { errors, validate } = useYup(values, validationSchema, {
        validateOnChange: false
    })

    const handleChange = e => {
        const { name, value } = e.target

        validate();
        setValues({
            ...values,
            [name]: value
        });
    }

    const handleResetPassword = async event => {
        event.preventDefault();
        validate()
        try {
            await app.auth().sendPasswordResetEmail(values.email).then(function () {
                console.log('reset password email sent')
                setValues({
                    email: ''
                })
                setFormSuccess('Please check your email for a link to change your password')
            }).catch(function (error) {
                console.error('An error occurred trying to send the reset password')
                setFormError('An error occurred trying to send the reset password')
            })
        } catch (error) {
            console.error('An error occurred')
            setFormError('An error occurred trying to send the reset password')
        }
    }

    return (

        <div class="flex flex-col bg-gray-300 items-center justify-center h-screen">
            <p class="mb-6 text-center text-gray-800 text-base font-bold text-xl">
                Forgot Password
            </p>
            {formSuccess && (<div class="w-100 m-3 bg-red-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Success!</strong>
                <span class="block sm:inline"> {formSuccess}</span>
            </div>)}
            {formError && (<div class="w-100 m-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline"> {formError}</span>
            </div>)}
            <form onSubmit={handleResetPassword} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/3">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                        E-mail
                    </label>
                    <input
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="text"
                        name="email"
                        placeholder="Enter your email address"
                        value={values.email}
                        onChange={e => handleChange(e)}
                        style={{ transition: "all .15s ease" }}
                    />
                    {errors.email && (<p class="text-red-500 text-xs italic">{errors.email}</p>)}
                </div>

                <div class="flex flex-col items-center">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mb-4 rounded focus:outline-none focus:shadow-outline">
                        Send Password Reset
                    </button>
                    <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/login">
                        Back to Login
                    </a>
                </div>
            </form>

        </div>
    );
};

export default withRouter(ForgotPassword);