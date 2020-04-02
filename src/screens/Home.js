import React, { useMemo, useState, useEffect, useContext } from 'react'
import { format, compareAsc, parse, differenceInCalendarYears, differenceInYears } from 'date-fns'
import axios from 'axios'

import firebase from "../config/firebase";

import { AuthContext } from '../context/Auth'

import Table from '../components/ReactTable'
import Modal from '../components/Modal'
import AlertModal from '../components/AlertModal'
import CaseForm from '../components/CaseForm'

import * as yup from 'yup';
import useYup from '@usereact/use-yup'


const validationSchema = yup.object().shape({
  order_cost: yup.number().min(0).required(),
  order_status: yup.string().required()
});

const Dashboard = (props) => {

  const auth = useContext(AuthContext);
  const { currentUser } = auth
  console.log(currentUser.uid)

  const [items, setItems] = React.useState([]);
  const [caseInfo, selectCase] = React.useState(null);
  // const [orderList, setOrderList] = React.useState([]);
  const [formValues, setFormValues] = React.useState({ cost: '', status: '' });
  const [filterText, setFilterText] = useState('')
  const [indexChecked, toggleIndexChecked] = useState(true)
  const [isModalOpen, toggleModal] = React.useState(false);
  const [isCancelModalOpen, toggleCancelModal] = React.useState(false);
  const [modalContent, setModalContent] = React.useState('');

  const [formError, setFormError] = useState('')

  const { errors, validate } = useYup(formValues, validationSchema, {
    validateOnChange: false
  })

  let guid = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  const handleChange = e => {
    const { name, value } = e.target

    validate();
    setFormValues({
      ...formValues,
      [name]: value
    });
  }

  const fetchData = async () => {

    // setOrderList([])
    const db = firebase.firestore();
    const data = await db.collection('cases').get();
    // console.log(data)
    setItems(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));

  };

  useEffect(() => {
    console.log('fetch data')
    fetchData()
  }, [])

  const handleToggleModal = () => {
    // fetchData()
    selectCase({})
    toggleModal(!isModalOpen)
  }

  const handleAddItem = async (caseObj) => {

    const db = firebase.firestore();
    const newItemID = guid();
    // console.log(newItem)
    if (caseObj) {
      // await db.collection("customers").doc(currentUser.uid).collection('cart').add({ name: newItem, quantity: 1 });
      try {
        await db.collection("cases").doc(newItemID).set({ ...caseObj, case_indexId: 0, case_status: 'pending', dateAdded: format(new Date(), 'yyyy-MM-dd HH:mm') });
      } catch (error) {
        // alert(error);
        console.error(error)
        setFormError('Sorry but we do not recognize that email/password combination. Please try again')
      }

      // setItems([...items, { id: newItemID, name: newItem, quantity: 1 }])
    }

    toggleModal(!isModalOpen)
    fetchData()
    // setNewItem('')

  };

  const handleUpdateItem = async (caseObj) => {

    const db = firebase.firestore();
    const newItemID = guid();
    // console.log(caseObj)
    if (caseObj) {
      try {
        // await db.collection("customers").doc(currentUser.uid).collection('cart').add({ name: newItem, quantity: 1 });
        await db.collection("cases").doc(caseObj.id).update(caseObj);

      } catch (error) {
        // alert(error);
        console.error(error)
        setFormError('Sorry but we do not recognize that email/password combination. Please try again')
      }
      // setItems([...items, { id: newItemID, name: newItem, quantity: 1 }])
    }

    toggleModal(!isModalOpen)
    fetchData()
    // setNewItem('')

  };

  const handleViewContact = (caseId) => {
    console.log('view contact', caseId)
    props.history.push('/contacts/' + caseId)
  }

  const handleIndexChecked = () => {
    console.log(indexChecked)
    toggleIndexChecked(!indexChecked)
    console.log(indexChecked)
    if (!indexChecked) {
      console.log('checked')
      // setItems(items.filter((item) => item.case_indexId === 0))
    } else {
      // setItems(items)
    }

    // let newItems = { ...items }
    // if (indexChecked) {
    //   newItems = items.filter((item) => item.case_indexId === 0)
    // }
    // setItems(newItems)

  }


  const columns = useMemo(
    () => [

      // {
      //   Header: "Id",
      //   accessor: "id",
      //   // Cell: (row, data) => { return (<p>{format(parse('2020-01-01', 'yyyy-MM-dd', new Date()), 'LL')}</p>) },
      //   // width: 500,
      //   filterMethod: (filter, row) =>
      //     row[filter.id].startsWith(filter.value) &&
      //     row[filter.id].endsWith(filter.value)
      // },
      {
        Header: "Date",
        accessor: "dateAdded",
        // Cell: (row, data) => { return (<p>{format(parse('2020-01-01', 'yyyy-MM-dd', new Date()), 'LL')}</p>) },
        // width: 500,
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
      },
      {
        Header: "Name",
        accessor: "case_name",
        // width: 200,
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
      },
      {
        Header: "Symptoms",
        accessor: "case_symptoms",
        Cell: (row, data) => <ul>{row.row.original.case_symptoms.map(item => <li>{item.label},</li>)}</ul>,
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
      },
      // {
      //   Header: "Home #",
      //   accessor: "case_home_number",
      //   // width: 200,
      //   filterMethod: (filter, row) =>
      //     row[filter.id].startsWith(filter.value) &&
      //     row[filter.id].endsWith(filter.value)
      // },
      {
        Header: "Mobile #",
        accessor: "case_mobile_number",
        // width: 200,
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
      },
      {
        Header: "Countries",
        accessor: "case_country",
        Cell: (row, data) => <ul>{row.row.original.case_country.map(item => <li>{item.label},</li>)}</ul>,
        // width: 200,
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
      },
      {
        Header: "Age",
        accessor: "case_birthdate",
        // Cell: (text, row) => differenceInCalendarYears(new Date(), parse(
        //   row.original.case_birthdate,
        //   'YYYY/MM/DD',
        //   new Date()
        // )),
        Cell: (row, data) => <p>{differenceInYears(new Date(), parse(row.row.original.case_birthdate, 'yyyy-MM-dd', new Date()))} yrs</p>,
        // width: 200,
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
      },

      {
        Header: "Gender",
        accessor: "case_gender",
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
      },
      {
        Header: "Outcome",
        accessor: "case_status",
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)

      },
      {
        Header: 'Action',
        accessor: 'action',
        Cell: ({ cell: { row } }) => (
          <div class="flex justify-between">
            <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs py-2 px-2 rounded shadow"
              onClick={() => {
                console.log(row.original.case_name);
                selectCase(row.original)
                // setModalContent({ modalTitle: 'Order Details', customerId: row.original.customerId, confirmText: 'Ok' })
                toggleModal(!isModalOpen)
              }}>
              Edit
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs py-2 px-2 rounded shadow"
              onClick={() => handleViewContact(row.original.id)}>
              View
            </button>
          </div>
        )
      },



    ],
    []
  );
  console.log('cases', items)
  return (
    <>
      <div class="flex my-16">

        <div class="w-full p-2 h-50">
          <div className="flex justify-between mb-3">
            <h4 className="font-semibold">List of Index Cases</h4>
            <button class="bg-blue-500 py-2 px-4 rounded text-white" onClick={handleToggleModal}>Add New Case</button>
          </div>
          <div>
            {items &&
              <>
                <div className='flex flex-row'>
                  <div className="w-10/12">
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      name="filterText"
                      value={filterText}
                      onChange={e => setFilterText(e.target.value)}
                      placeholder={"Search for a case by name"}
                    />
                  </div>
                  <div className="w-2/12">
                    <div className="px-3 content-center justify-center items-center">
                      <label class="block text-gray-500 font-normal">
                        <input type="checkbox" checked={indexChecked} class="leading-loose text-pink-600" onChange={handleIndexChecked} />
                        <span class="text-sm text-gray-600"> Index Cases Only </span>
                      </label>
                    </div>
                  </div>
                </div>


                <Table
                  columns={columns}
                  data={items.filter((item) => indexChecked ? item.case_indexId == 0 : item).filter((item) => item.case_name.toLowerCase().includes(filterText))}
                />
              </>}
          </div>

          {caseInfo && (<Modal isOpen={isModalOpen} title={Object.entries(caseInfo).length === 0 ? "Add New Case" : "Case Details"} toggleModal={handleToggleModal} content={modalContent}>

            <CaseForm editing={Object.entries(caseInfo).length > 0 ? true : false} caseData={caseInfo} onAdd={(data) => handleAddItem(data)} onUpdate={((data) => handleUpdateItem(data))} onCancel={handleToggleModal} />

          </Modal>
          )}


        </div>
      </div>


    </>
  );

}

export default Dashboard