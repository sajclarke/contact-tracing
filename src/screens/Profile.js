import React, { useState, useContext } from "react";
import firebase from "../config/firebase";
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/Auth'

import * as yup from 'yup';
import useYup from '@usereact/use-yup'


const validationSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(6).required()
});

const Profile = () => {
    const auth = useContext(AuthContext);
    // console.log(auth)
    const { currentUser } = auth

    const [values, setValues] = useState({
        email: '',
        password: '',
    })
    const [formError, setFormError] = useState('')


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

    const handleSubmit = async e => {
        e.preventDefault()
        const { email, password } = values;
        try {
            await firebase
                .auth()
                .signInWithEmailAndPassword(email, password);
            // history.push("/");
        } catch (error) {
            // alert(error);
            console.error(error)
            setFormError('Sorry but we do not recognize that email/password combination. Please try again')
        }
    }

    return (
        <>
            <div class="flex my-16">

                <div class="w-full p-2 h-screen">
                    <div className="h-1/3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
                        <p class="text-center text-gray-800 text-base font-bold text-xl">
                            Change Password
                        </p>
                        <form class="" onSubmit={handleSubmit}>
                            {formError && (
                                <div class="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded relative" role="alert">
                                    <strong class="font-bold">Error!</strong>
                                    <span class="block sm:inline"> {formError}</span>
                                </div>)}
                            {/* <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                    E-mail
                                </label>
                                <input name="email" value={values.email} onChange={e => handleChange(e)} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email" />
                                {errors.email && (<p class="text-red-500 text-xs italic">{errors.email}</p>)}
                            </div> */}
                            <div class="my-6">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                                    Password
                                </label>
                                <input name="password" value={values.password} onChange={e => handleChange(e)} class="shadow appearance-none border border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" />
                                {/* <p class="text-red-500 text-xs italic">Please choose a password.</p> */}
                                {errors.password && (<p class="text-red-500 text-xs italic">{errors.password}</p>)}
                            </div>
                            <div class="flex flex-col items-center justify-between">
                                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mb-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                    Save
                                </button>


                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;