import React from 'react'
import { Link } from 'react-router-dom'
import firebase from "../config/firebase";

const Navbar = () => {
    return (
        <nav className="inset-x-0 top-0 z-40 w-full py-4 bg-transparent bg-gray-800 xl:py-4 shadow-md" id="navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">

                    <Link className='flex-1' to='/'>
                        <div className="flex items-center flex-shrink-0 text-white mr-16">
                            <span className="font-semibold text-xl tracking-tight">Contact Tracing</span>
                        </div>
                    </Link>

                    <nav className="flex-1 flex justify-end items-center">
                        <Link to='/' className="font-medium text-white hover:text-gray-600 text-sm mr-3">
                            Home
                        </Link>

                        <button onClick={() => firebase.auth().signOut()} className="block px-4 py-2 mt-3 font-medium text-white bg-blue-500 rounded hover:bg-blue-700 md:ml-6 md:mt-0 text-sm leading-tight">
                            Sign Out
                        </button>
                    </nav>
                </div>
            </div>
        </nav>

    )

}

export default Navbar