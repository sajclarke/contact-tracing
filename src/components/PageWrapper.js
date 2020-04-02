import React, { useState, useContext } from 'react'
import Navbar from './StickyNav'
import FooterSmall from './FooterSmall'

const PageWrapper = ({ children }) => {
    return (
        <div className='flex flex-col min-h-screen'>
            <Navbar />
            <main className='flex-1'>
                <div className="w-full overflow-scroll flex flex-col items-center justify-center content-center bg-gray-200 px-3">
                    {children}
                </div>

            </main>
            {/* <FooterSmall absolute /> */}
        </div>
    )
}

export default PageWrapper