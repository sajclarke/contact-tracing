import React, { useMemo, useState, useEffect, useContext } from 'react'
import axios from 'axios'

import firebase from "../config/firebase";

import { AuthContext } from '../context/Auth'

import Table from '../components/ReactTable'
import Modal from '../components/Modal'
import AlertModal from '../components/AlertModal'

import * as yup from 'yup';
import useYup from '@usereact/use-yup'


const validationSchema = yup.object().shape({
    order_cost: yup.number().min(0).required(),
    order_status: yup.string().required()
});

const Dashboard = () => {

    const auth = useContext(AuthContext);
    const { currentUser } = auth
    console.log(currentUser.uid)

    const [cartItems, setCartItems] = React.useState([]);
    const [order, selectOrder] = React.useState(null);
    const [orderList, setOrderList] = React.useState([]);
    const [formValues, setFormValues] = React.useState({ cost: '', status: '' });
    const [data, setData] = useState([])
    const [isModalOpen, toggleModal] = React.useState(false);
    const [isCancelModalOpen, toggleCancelModal] = React.useState(false);
    const [modalContent, setModalContent] = React.useState('');

    const [formError, setFormError] = useState('')

    const { errors, validate } = useYup(formValues, validationSchema, {
        validateOnChange: false
    })

    const handleChange = e => {
        const { name, value } = e.target

        validate();
        setFormValues({
            ...formValues,
            [name]: value
        });
    }

    const fetchData = async () => {

        setOrderList([])
        const db = firebase.firestore();
        const ref = db.collection("customers")

        let orderData = await db.collection('orders').orderBy('dateAdded', 'desc').get()
        orderData = orderData.docs.map(doc => ({ ...doc.data(), id: doc.id }))

        await orderData.map(async currentOrder => {
            const newOrder = { ...currentOrder }

            await ref.doc(newOrder.customerId).get().then(function (doc) {
                if (doc.exists) {
                    console.log("Document data:", doc.data());
                    currentOrder.customer = doc.data()
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });

            const data = await ref.doc(newOrder.customerId).collection('cart').get();
            // console.log(data)
            // console.log(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            currentOrder.cartItems = data.docs.map(doc => ({ ...doc.data(), customerId: newOrder.customerId, id: doc.id }))
            // await ref.doc(newOrder.customerId).collection('cart').get().then(function (doc) {
            //     if (doc.exists) {
            //         console.log("Cart items:", doc.data());
            //         currentOrder.cartItems = doc.data()
            //     } else {
            //         // doc.data() will be undefined in this case
            //         console.log("No cart items for " + newOrder.customerId + "!");
            //     }
            // }).catch(function (error) {
            //     console.log("Error getting document:", error);
            // });
            // order.push(currentOrder)
            // console.log(order)
            // setOrder(order)
            // console.log([...order, currentOrder])
            // setOrder([...order, currentOrder])
            setOrderList(order => [...order, currentOrder]);
            // setOrder(prevState => )
            // return 24
        })



    };

    useEffect(() => {
        console.log('fetch data')
        fetchData()
    }, [])

    const handleToggleModal = () => {
        // fetchData()
        toggleModal(!isModalOpen)
    }

    const handleCancelOrder = async () => {
        console.log('cancel order')
        // toggleCancelModal(!isCancelModalOpen)

        const db = firebase.firestore();
        // console.log(newItem)
        //Update order information
        await db.collection('orders')
            .doc(order.id)
            .update({ status: "cancelled" });
        fetchData()
        toggleCancelModal(!isCancelModalOpen)
    }

    const handleSaveOrder = async () => {
        console.log('save order')
        const db = firebase.firestore();
        // console.log(newItem)
        //Update order information
        await db.collection('orders')
            .doc(order.id)
            .update({ status: formValues.order_status, cost: parseFloat(formValues.order_cost) });

        //Send email via firebase function
        // await axios.post(
        //     process.env.REACT_APP_FIREBASE_FUNCTION_URL + '/sendmail',
        //     { email: currentUser.email, status: 'paid', cost: order.cost, title: 'WiFetch: Payment Received' }
        // );
        fetchData()
        toggleModal(!isModalOpen)
    }

    const columns = useMemo(
        () => [

            {
                Header: "Date",
                accessor: "dateAdded",
                // width: 500,
                filterMethod: (filter, row) =>
                    row[filter.id].startsWith(filter.value) &&
                    row[filter.id].endsWith(filter.value)
            },
            {
                Header: "Customer",
                accessor: "customer.user_name",
                // width: 200,
                filterMethod: (filter, row) =>
                    row[filter.id].startsWith(filter.value) &&
                    row[filter.id].endsWith(filter.value)
            },
            {
                Header: "Home #",
                accessor: "customer.user_home_number",
                // width: 200,
                filterMethod: (filter, row) =>
                    row[filter.id].startsWith(filter.value) &&
                    row[filter.id].endsWith(filter.value)
            },
            {
                Header: "Mobile #",
                accessor: "customer.user_mobile_number",
                // width: 200,
                filterMethod: (filter, row) =>
                    row[filter.id].startsWith(filter.value) &&
                    row[filter.id].endsWith(filter.value)
            },
            // {
            //     Header: "Parish",
            //     accessor: "",
            //     // width: 200,
            //     filterMethod: (filter, row) =>
            //         row[filter.id].startsWith(filter.value) &&
            //         row[filter.id].endsWith(filter.value)

            // },

            // {
            //     Header: "Total Cost",
            //     accessor: "cost",
            //     filterMethod: (filter, row) =>
            //         row[filter.id].startsWith(filter.value) &&
            //         row[filter.id].endsWith(filter.value)

            // },
            {
                Header: "Status",
                accessor: "status",
                filterMethod: (filter, row) =>
                    row[filter.id].startsWith(filter.value) &&
                    row[filter.id].endsWith(filter.value)

            },
            {
                Header: 'Action',
                accessor: 'action',
                Cell: ({ cell: { row } }) => (
                    <div class="flex justify-between">
                        <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold uppercase text-xs py-2 px-2 rounded shadow"
                            onClick={() => {
                                console.log(row);
                                selectOrder(row.original)
                                setModalContent({ modalTitle: 'Order Details', customerId: row.original.customerId, confirmText: 'Ok' })
                                toggleModal(!isModalOpen)
                            }}>
                            View
                        </button>
                        {/* <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs py-2 px-2 rounded shadow"
                            onClick={() => console.log(row)}>
                            <i class="fas fa-trash"></i>
                        </button> */}
                    </div>
                )
            },



        ],
        []
    );
    console.log(orderList, order)
    return (
        <>
            <div class="container flex my-16">

                <div class="w-1/4  h-50">
                    <div class="rounded-lg overflow-hidden shadow-lg bg-white min-h-64">
                        <div class="bg-gray-400 flex justify-between px-2 py-3">

                            <h3 class="font-normal px-2 py-3 leading-tight">Index Cases</h3>
                            <button class="bg-blue-500 py-2 px-4 rounded text-white">Invite</button>

                        </div>

                        <div class="px-2">
                            <svg class="absolute z-50 m-1 mt-4 text-blue-400" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14.71 14H15.5L20.49 19L19 20.49L14 15.5V14.71L13.73 14.43C12.59 15.41 11.11 16 9.5 16C5.90997 16 3 13.09 3 9.5C3 5.90997 5.90997 3 9.5 3C13.09 3 16 5.90997 16 9.5C16 11.11 15.41 12.59 14.43 13.73L14.71 14ZM5 9.5C5 11.99 7.01001 14 9.5 14C11.99 14 14 11.99 14 9.5C14 7.01001 11.99 5 9.5 5C7.01001 5 5 7.01001 5 9.5Z"
                                    fill="black" fill-opacity="0.54" />
                            </svg>
                            <input type="text" class="pl-8 p-1 mt-3 bg-gray-200 w-full rounded relative" placeholder="Search by name" />
                        </div>
                        <div class="py-5 px-3">
                            <div class="flex justify-between px-2 py-2">
                                <p class="flex text-gray-700">
                                    <svg class="w-2 text-gray-500 mx-2" viewBox="0 0 8 8" fill="currentColor">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                    Tighten Co.
      </p>
                                <p class="text-gray-500 font-thin">Team</p>
                            </div>
                            <div class="flex justify-between px-2 py-2 bg-blue-100 rounded">
                                <p class="flex text-gray-700">
                                    <svg class="h2 w-2 text-teal-500 mx-2" viewBox="0 0 8 8" fill="currentColor">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                    Taylor Otwell
      </p>
                                <p class="text-gray-500 font-thin">Member</p>
                            </div>
                            <div class="flex justify-between px-2 py-2">
                                <p class="flex text-gray-700">
                                    <svg class="h2 w-2 text-gray-500 mx-2" viewBox="0 0 8 8" fill="currentColor">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                    Adam Wathan
      </p>
                                <p class="text-gray-500 font-thin">Member</p>
                            </div>
                            <div class="flex justify-between px-2 py-2">
                                <p class="flex text-gray-700">
                                    <svg class="h2 w-2 text-gray-500 mx-2" viewBox="0 0 8 8" fill="currentColor">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                    Ahmed Ashraf
      </p>
                                <p class="text-gray-500 font-thin">Member</p>
                            </div>
                            <div class="flex justify-between px-2 py-2">
                                <p class="flex text-gray-700">
                                    <svg class="h2 w-2 text-teal-500 mx-2" viewBox="0 0 8 8" fill="currentColor">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                    Laracasts
      </p>
                                <p class="text-gray-500 font-thin">Team</p>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="w-3/4 p-5 h-50">
                    <div className="flex justify-between">
                        <h4>List of Contacts</h4>
                        <button class="bg-blue-500 py-2 px-4 rounded text-white">Add New Contact</button>
                    </div>
                    <div>
                        {orderList && <Table
                            // filterable
                            // defaultFilterMethod={(filter, row) =>
                            //     String(row[filter.id]) === filter.value}
                            // title="Order History"
                            columns={columns}
                            data={orderList}
                        />}
                    </div>

                </div>
            </div>

            <div class="w-9/12 content-center items-center justify-center">

                <Modal isOpen={isModalOpen} toggleModal={handleToggleModal} content={modalContent} onConfirm={handleToggleModal}>
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
                        List of Items
                    </label>
                    <ul className="p-3">
                        {order && order.cartItems.map((elem, key) => <li className="text-black">{elem.name} x {elem.quantity}</li>)}
                        {/* {order && order.map((item, index) => { return (item.cartItems.filter(elem => elem.customerId == modalContent.customerId).map((elem, key) => <p className="text-black">{elem.name}</p>)) })} */}
                    </ul>

                    <form>
                        <div className="flex flex-wrap -mx-3 mb-6">

                            <div className="w-1/2 px-2">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                    Cost
                            </label>
                                <input
                                    type='number'
                                    name="order_cost"
                                    value={formValues.order_cost}
                                    onChange={e => handleChange(e)}
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-password"
                                    placeholder="How much?" />
                                {/* {errors.user_address && (<p className="text-red-500 text-xs italic">{errors.user_address}</p>)} */}
                            </div>
                            <div className="w-1/2 mb-6 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
                                    Status
                            </label>
                                <div className="relative">
                                    <select name="order_status" value={formValues.order_status} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" >
                                        <option value=''>--Select One--</option>
                                        <option value='approved'>Approved</option>
                                        <option value='paid'>Paid</option>
                                        <option value='delivered'>Delivered</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button type="button" className="bg-transparent text-red-500 font-normal py-2 px-4 mt-5 rounded" onClick={() => toggleCancelModal(!isCancelModalOpen)}>
                                Cancel Order
                        </button>

                            <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-normal py-2 px-4 mt-5 rounded" onClick={handleSaveOrder}>
                                Save Changes
                        </button>
                        </div>
                    </form>

                </Modal>

                <AlertModal
                    isOpen={isCancelModalOpen}
                    content={{ modalTitle: 'Are you sure?', modalContent: "By doing this, you will cancel this order and the customer will be notified", confirmText: 'Ok' }}
                    toggleModal={() => toggleCancelModal(!isCancelModalOpen)}
                    onConfirm={handleCancelOrder}
                />
            </div>
        </>
    );

}

export default Dashboard