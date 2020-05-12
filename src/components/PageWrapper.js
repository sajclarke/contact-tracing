import React from 'react'
import Navbar from './Navbar'

const PageWrapper = ({ children }) => {
    return (
        <div className="flex flex-col w-full h-screen min-h-screen overflow-auto">
            <Navbar />
            <main className="flex-grow h-auto bg-gray-300 min-w-full pb-16">{children}</main>
        </div>
    )
}

export default PageWrapper