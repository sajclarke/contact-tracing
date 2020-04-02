import React from 'react'

const Modal = (props) => {
    const { isOpen, content, toggleModal, onConfirm } = props
    return (
        <div class={(isOpen
            ? "modal-active"
            : "opacity-0 pointer-events-none ") + "modal fixed w-full h-full top-0 left-0 flex items-center justify-center py-16"}>
            <div class="modal-overlay absolute w-full h-full bg-gray-900 z-20 opacity-50"></div>

            <div class="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 h-full overflow-y-scroll">

                {/* <div class="modal-close absolute top-0 right-0 cursor-pointer flex flex-col items-center mt-4 mr-4 text-white text-sm z-50">
                    <svg class="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                        <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                    </svg>
                    <span class="text-sm">(Esc)</span>
                </div> */}


                <div class="modal-content py-4 text-left px-6">

                    <div class="flex justify-between items-center pb-3">
                        <p class="text-2xl font-bold">{props.title}</p>
                        <div className="modal-close cursor-pointer z-50" onClick={toggleModal}>
                            <svg class="fill-current text-black" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                            </svg>
                        </div>
                    </div>


                    {props.children}
                    {/* {content.modalContent} */}


                    {/* <div class="flex justify-between pt-2">
                        <button type='button' onClick={toggleModal} className="px-4 bg-transparent p-3 cursor-pointer rounded-lg text-indigo-500 hover:bg-gray-100 hover:text-indigo-400 mr-2">Cancel</button>
                        <button type='button' onClick={onConfirm} class="modal-close px-4 bg-indigo-500 p-3 rounded-lg text-white hover:bg-indigo-400">Ok</button>
                    </div> */}

                </div>
            </div>
        </div>
    );
}

export default Modal;