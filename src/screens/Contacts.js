import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { format, parse, differenceInYears, differenceInDays, isValid } from 'date-fns'

import swal from 'sweetalert';
import firebase from "../config/firebase";

import { AuthContext } from '../context/Auth'

import Table from '../components/ReactTable'
import Modal from '../components/Modal'
import CaseForm from '../components/CaseForm'

// import * as yup from 'yup';
// import useYup from '@usereact/use-yup'


// const validationSchema = yup.object().shape({
//   order_cost: yup.number().min(0).required(),
//   order_status: yup.string().required()
// });

const Contacts = (props) => {

  const auth = useContext(AuthContext);
  const { currentUser } = auth
  console.log(currentUser.uid)

  const [items, setItems] = useState([]);
  const [editMode, toggleEdit] = useState(false);
  const [patients, setPatients] = useState([]);
  const [caseInfo, setCase] = useState(null);
  const [caseId, setCaseId] = useState(0);
  // const [caseAuthor, setCaseAuthor] = React.useState(null);
  const [indexCase, setIndexCase] = useState([]);
  const [contactCase, setContactCase] = useState(null);
  // const [formValues, setFormValues] = useState({ cost: '', status: '' });
  const [modalData, setModalData] = useState(null)
  const [isModalOpen, toggleModal] = useState(false);
  // const [isCancelModalOpen, toggleCancelModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // const [formError, setFormError] = useState('')

  // const { errors, validate } = useYup(formValues, validationSchema, {
  //   validateOnChange: false
  // })

  let guid = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }



  const fetchData = async (caseId) => {

    // setOrderList([])
    console.log(caseId)
    const db = firebase.firestore();
    await db.collection('cases').doc(caseId).get().then(async (doc) => {
      if (doc.exists) {

        console.log("Document data:", doc.data());
        setCase({ ...doc.data(), id: doc.id })

        if (doc.data().case_indexId !== 0) {
          //TODO: map case_indexId to get index names for each case
          const indices = doc.data().case_indexId.split(',')
          console.log(indices)
          indices.map(async (index) => {
            await db.collection('cases').doc(index).get().then(async (doc) => {
              if (doc.exists) {
                console.log(index, doc.data().case_name, doc.data().case_indexId)
                // setIndexCase({ ...doc.data(), id: doc.id })
                let caseInfo = { ...doc.data(), id: doc.id }
                console.log(caseInfo)
                if (caseInfo.case_indexId !== 0) {
                  await db.collection('cases').doc(caseInfo.case_indexId).get().then((doc) => {
                    // doc.exists && console.log({ ...doc.data(), id: doc.id }))
                    if (doc.exists) {
                      console.log({ ...doc.data(), id: doc.id })
                      if (doc.data().case_indexId === 0) {
                        setIndexCase([{ ...doc.data(), id: doc.id }])
                      }
                    }
                  })
                }


                // setContactCase(prevState => [...prevState || [], caseInfo])
                if (doc.data().case_indexId === 0) {
                  setIndexCase(prevState => [...prevState || [], { ...doc.data(), id: doc.id }])
                  // setIndexCase([], { ...doc.data(), id: doc.id })
                } else {
                  console.log('primary contacts')
                  setContactCase(prevState => [...prevState || [], { ...doc.data(), id: doc.id }])
                }

              }
            })
          })

        }

      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });

    // const contactsData = await db.collection('cases').where('case_indexId', 'array-contains', caseId).get();
    const contactsData = await db.collection('cases').get();
    // console.log(caseData, contactsData)
    // console.log(data)
    console.log(contactsData.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    let contactList = contactsData.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    console.log(contactList.filter((item) => item.case_indexId ? item.case_indexId.split(',').includes(caseId) : false))
    // setItems(contactsData.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    setItems(contactList.filter((item) => item.case_indexId ? item.case_indexId.split(',').includes(caseId) : false))


    const patientsData = await db.collection('cases').get();
    // console.log(caseData, contactsData)
    // console.log(data)
    // const patientsList = patientData.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    setPatients(patientsData.docs.map(doc => ({ ...doc.data(), id: doc.id })));


  };



  useEffect(() => {

    console.log(props)
    // const locationInfo = window.location.pathname.split('/')
    // const caseId = locationInfo[locationInfo.length - 1]
    const caseId = props.match.params.contactId;
    // const { currentCase } = props.location.state
    // setIndexCase(props.location.state.currentCase)
    console.log('fetch data', caseId)
    setCaseId(caseId)
    setIndexCase(null)
    setContactCase(null)
    fetchData(caseId)
  }, [props])

  const handleToggleModal = () => {
    // fetchData()
    // setModalData({})
    const blank_data = {}
    setModalData({ ...blank_data, 'case_indexId': caseId })
    toggleEdit(false)
    toggleModal(!isModalOpen)
  }

  const handleAddItem = async (caseObj) => {

    const db = firebase.firestore();
    const newItemID = guid();
    // console.log(newItem)
    // console.log(caseObj)
    // return;
    if (caseObj) {
      // await db.collection("customers").doc(currentUser.uid).collection('cart').add({ name: newItem, quantity: 1 });
      try {
        await db.collection("cases").doc(newItemID)
          .set({
            ...caseObj,
            author: currentUser.email,
            addedBy: currentUser.uid,
            dateAdded: format(new Date(), 'yyyy-MM-dd HH:mm')
          });
      } catch (error) {
        // alert(error);
        console.error(error)
        // setFormError('Sorry but we do not recognize that email/password combination. Please try again')
      }
      // await db.collection("cases").doc(newItemID).set({ ...caseObj, case_indexId: caseId, case_status: 'pending', dateAdded: format(new Date(), 'yyyy-MM-dd HH:mm') });
      // setItems([...items, { id: newItemID, name: newItem, quantity: 1 }])
    }

    toggleModal(!isModalOpen)
    fetchData(caseId)
    // setNewItem('')

  };

  const handleUpdateItem = async (caseObj) => {

    const db = firebase.firestore();
    // const newItemID = guid();
    // console.log(newItem)
    // console.log(caseObj)
    // return;
    if (caseObj) {

      caseObj.updatedBy = currentUser.email
      caseObj.dateUpdated = format(new Date(), 'yyyy-MM-dd HH:mm')
      try {
        // await db.collection("customers").doc(currentUser.uid).collection('cart').add({ name: newItem, quantity: 1 });
        await db.collection("cases").doc(caseObj.id).update(caseObj);
        // setItems([...items, { id: newItemID, name: newItem, quantity: 1 }])
      } catch (error) {
        // alert(error);
        console.error(error)
        // setFormError('Sorry but we do not recognize that email/password combination. Please try again')
      }
    }

    toggleModal(!isModalOpen)
    fetchData(caseId)
    // setNewItem('')

  };

  const handleRemoveItem = (caseObj) => {

    const db = firebase.firestore();
    console.log(caseObj.id)
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this record!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then(async (value) => {
        // console.log(value)
        if (value) {
          try {
            // await db.collection("customers").doc(currentUser.uid).collection('cart').add({ name: newItem, quantity: 1 });
            await db.collection("cases").doc(caseObj.id).update({ archived: 1 });
            toggleModal(!isModalOpen)
            fetchData(caseId)
          } catch (error) {
            // alert(error);
            console.error(error)
            // setFormError('Sorry but we do not recognize that email/password combination. Please try again')
          }
        }


      });
  }

  const handleViewContact = (caseId) => {
    console.log('view contact', caseId, caseInfo)
    props.history.push('/contacts/' + caseId, { currentCase: caseInfo })
  }


  const columns = [

    {
      Header: "#",
      disableFilters: true,
      accessor: (row, i) => i + 1,
    },
    {
      Header: "Date",
      accessor: "dateAdded",
      disableFilters: true,
    },
    {
      Header: "Name",
      // accessor: "case_name",
      id: "name",
      accessor: d => d.case_name.trim().split(' ').reverse().join(', '),
      // accessor: d => <div className='text-left p-2'><i className='fas fa-exclamation-triangle text-red-500 p-2'></i>{d.case_name.trim().split(' ').reverse().join(', ')}</div>,
      Cell: (row, data) => {
        const caseName = row.row.original.case_name.trim().split(' ').reverse().join(', ')
        const { isDuplicate } = row.row.original
        return (
          <div className={'text-left p-2 ' + (isDuplicate ? 'tooltip' : '')}>
            {isDuplicate && <>
              <i className='fas fa-exclamation-triangle text-red-400 p-3'></i>
              <span className='relative bottom-10 tooltip-text bg-red-300 p-3 -mt-6 -ml-6 rounded'>Possible duplicate</span>
            </>
            }{caseName}
          </div>
        )
      },
    },
    {
      Header: "Symptoms",
      accessor: "case_symptoms",
      // Cell: (row, data) => <ul>{row.row.original.case_symptoms.map(item => <li>{item.label},</li>)}</ul>,
      Cell: (row, data) => { return (row.row.original.case_symptoms.length > 0 ? <ul>{row.row.original.case_symptoms.map((item, index) => <li key={index}>{item.label},</li>)}</ul> : <span></span>) },
      // filterMethod: (filter, row) =>
      //   row[filter.id].startsWith(filter.value) &&
      //   row[filter.id].endsWith(filter.value)
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
      // filterMethod: (filter, row) =>
      //   row[filter.id].startsWith(filter.value) &&
      //   row[filter.id].endsWith(filter.value)
    },
    {
      Header: "Visited",
      accessor: "case_country",
      // Cell: (row, data) => {
      //   return {
      //     row.row.original.case_country.length > 0 ? <ul>{row.row.original.case_country.map(item => <li>{item.label},</li>)}</ul> : <span></span>
      //   }
      // },
      Cell: (row, data) => {
        return (
          row.row.original.case_country && row.row.original.case_country.length > 0 ? <ul>{row.row.original.case_country.map((item, index) => <li key={index}>{item.label},</li>)}</ul> : <span></span>)
      },
      // width: 200,
      // filterMethod: (filter, row) =>
      //   row[filter.id].startsWith(filter.value) &&
      //   row[filter.id].endsWith(filter.value)
    },
    {
      Header: "Age",
      id: "age",
      accessor: d => d.case_age ? Number(d.case_age) : (isValid(parse(d.case_birthdate, 'yyyy-MM-dd', new Date())) ? Number(differenceInYears(new Date(), parse(d.case_birthdate, 'yyyy-MM-dd', new Date()))) : '-'),
      // sortMethod: (a, b) => Number(a) - Number(b),
      // sortType: 'basic',
      minWidth: 140,
      maxWidth: 200,
      // sortType: "basic",
      disableFilters: true,
      // Cell: (row, data) => {
      //   return (isValid(parse(row.row.original.case_birthdate, 'yyyy-MM-dd', new Date())) ?
      //     Number(differenceInYears(new Date(), parse(row.row.original.case_birthdate, 'yyyy-MM-dd', new Date()))) :
      //     row.row.original.case_age ? Number(row.row.original.case_age) : 'n/a'
      //   )
      // },
      // Filter: NumberRangeColumnFilter,
      // filter: 'between',
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
      disableFilters: true,
      Cell: ({ cell: { row } }) => (
        <div className="flex justify-between">
          <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs py-2 px-2 rounded shadow"
            onClick={() => {
              console.log(row.original.case_name);
              toggleEdit(true)
              setModalData(row.original)
              // setModalContent({ modalTitle: 'Order Details', customerId: row.original.customerId, confirmText: 'Ok' })
              toggleModal(!isModalOpen)
            }}>
            Edit
            </button>
          <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs py-2 px-2 rounded shadow"
            // onClick={() => console.log(caseInfo)}>
            onClick={() => handleViewContact(row.original.id)}>
            View
            </button>
        </div>
      )
    },



  ]
    ;
  // console.log(items, caseInfo, indexCase)
  console.log(indexCase)
  return (
    <>
      <div className="flex my-6">

        <div className="p-5 h-50">
          <div className="max-w-sm bg-white shadow-lg rounded-lg overflow-hidden my-4">
            {/* <img className="w-full h-56 object-cover object-center" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80" alt="avatar" /> */}
            <div className="flex items-center px-6 py-3 bg-gray-900">
              {/* <svg className="h-6 w-6 text-white fill-current" viewBox="0 0 512 512">
                <path d="M256 48C150 48 64 136.2 64 245.1v153.3c0 36.3 28.6 65.7 64 65.7h64V288h-85.3v-42.9c0-84.7 66.8-153.3 149.3-153.3s149.3 68.5 149.3 153.3V288H320v176h64c35.4 0 64-29.3 64-65.7V245.1C448 136.2 362 48 256 48z" />
              </svg> */}
              <h1 className="mx-3 text-white font-semibold text-lg">Case Info</h1>
            </div>
            {caseInfo && (
              <div className="py-4 px-6">
                <h1 className="text-2xl font-semibold text-gray-800">{caseInfo.case_name}</h1>

                {/* <p className='text-xs'>{caseInfo.case_indexId}</p> */}
                {indexCase && (
                  <div className="text-xs">
                    Index Case(s):{' '}
                    <ul>
                      {indexCase.map((item, index) => <li key={index}><Link className="text-blue-500 hover:underline" to={`${item.id}`}>{item.case_name}</Link></li>)}
                    </ul>
                  </div>
                )}
                {contactCase && (
                  <div className="text-xs">
                    Primary Contact(s):{' '}
                    <ul>
                      {contactCase.map((item, index) => <li key={index}><Link className="text-blue-500 hover:underline" to={`${item.id}`}>{item.case_name}</Link></li>)}
                    </ul>
                  </div>
                )}
                <h2 className="text-md pt-3 font-semibold text-gray-800">Status</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_status}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Exposure Location</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_exposure_location}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Exposure Date</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_exposure_date}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Countries Visited</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_country && caseInfo.case_country.map((item, index) => (<span key={index}>{item.label}, </span>))}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Symptoms</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_symptoms && caseInfo.case_symptoms.map((item, index) => (<span key={index}>{item.label}, </span>))}</p>
                {/* <p className="text-sm text-gray-700">{caseInfo.case_symptoms}</p> */}

                <h2 className="text-md pt-3 font-semibold text-gray-800">Gender</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_gender}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Age</h2>
                <p className="text-sm text-gray-700">{differenceInYears(new Date(), parse(caseInfo.case_birthdate, 'yyyy-MM-dd', new Date()))} yrs</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Home #</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_home_number}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Mobile #</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_mobile_number}</p>


                <h2 className="text-md pt-3 font-semibold text-gray-800">Address</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_address}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Conditions</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_conditions && caseInfo.case_conditions.map((item, index) => (<span key={index}>{item.label}, </span>))}</p>
                <h2 className="text-md pt-3 font-semibold text-gray-800">Notes</h2>
                <p className="text-sm text-gray-700">{caseInfo.case_notes}</p>
                {currentUser.admin && (
                  <>
                    <h2 className="text-md pt-3 font-semibold text-gray-800">Added By</h2>
                    {caseInfo.author && <p className="text-xs text-gray-500">{caseInfo.author}</p>}
                  </>
                )}

                {currentUser.admin && caseInfo.updatedBy && (
                  <>
                    <h2 className="text-md pt-3 font-semibold text-gray-800">Last Updated By</h2>
                    {caseInfo.updatedBy && <p className="text-xs text-gray-500">{caseInfo.updatedBy}</p>}
                    {caseInfo.dateUpdated && <p className="text-xs text-gray-500">({Number(differenceInDays(new Date(), new Date(caseInfo.dateUpdated)))} days ago)</p>}
                    {/* <span className='text-sm'>by</span>{' '} */}

                  </>
                )}



                {/* <div className="flex items-center mt-4 text-gray-700">
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 512 512">
                    <path d="M239.208 343.937c-17.78 10.103-38.342 15.876-60.255 15.876-21.909 0-42.467-5.771-60.246-15.87C71.544 358.331 42.643 406 32 448h293.912c-10.639-42-39.537-89.683-86.704-104.063zM178.953 120.035c-58.479 0-105.886 47.394-105.886 105.858 0 58.464 47.407 105.857 105.886 105.857s105.886-47.394 105.886-105.857c0-58.464-47.408-105.858-105.886-105.858zm0 186.488c-33.671 0-62.445-22.513-73.997-50.523H252.95c-11.554 28.011-40.326 50.523-73.997 50.523z" /><g><path d="M322.602 384H480c-10.638-42-39.537-81.691-86.703-96.072-17.781 10.104-38.343 15.873-60.256 15.873-14.823 0-29.024-2.654-42.168-7.49-7.445 12.47-16.927 25.592-27.974 34.906C289.245 341.354 309.146 364 322.602 384zM306.545 200h100.493c-11.554 28-40.327 50.293-73.997 50.293-8.875 0-17.404-1.692-25.375-4.51a128.411 128.411 0 0 1-6.52 25.118c10.066 3.174 20.779 4.862 31.895 4.862 58.479 0 105.886-47.41 105.886-105.872 0-58.465-47.407-105.866-105.886-105.866-37.49 0-70.427 19.703-89.243 49.09C275.607 131.383 298.961 163 306.545 200z" /></g>
                  </svg>
                  <h1 className="px-2 text-sm">MerakiTeam</h1>
                </div>
                <div className="flex items-center mt-4 text-gray-700">
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 512 512">
                    <path d="M256 32c-88.004 0-160 70.557-160 156.801C96 306.4 256 480 256 480s160-173.6 160-291.199C416 102.557 344.004 32 256 32zm0 212.801c-31.996 0-57.144-24.645-57.144-56 0-31.357 25.147-56 57.144-56s57.144 24.643 57.144 56c0 31.355-25.148 56-57.144 56z" />
                  </svg>
                  <h1 className="px-2 text-sm">California</h1>
                </div>
                <div className="flex items-center mt-4 text-gray-700">
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 512 512">
                    <path d="M437.332 80H74.668C51.199 80 32 99.198 32 122.667v266.666C32 412.802 51.199 432 74.668 432h362.664C460.801 432 480 412.802 480 389.333V122.667C480 99.198 460.801 80 437.332 80zM432 170.667L256 288 80 170.667V128l176 117.333L432 128v42.667z" />
                  </svg>
                  <h1 className="px-2 text-sm">patterson@example.com</h1>
                </div> */}
              </div>

            )}
          </div>

        </div>
        <div className="p-5 h-50">
          <div className="flex justify-between">
            <h4>List of Contacts</h4>
            <button className="px-4 py-2 mt-3 font-medium text-white bg-blue-500 rounded hover:bg-blue-700 md:ml-6 md:mt-0 text-sm leading-tight" onClick={handleToggleModal}>Add New Contact</button>
          </div>
          <div>
            {items && <Table
              // filterable
              // defaultFilterMethod={(filter, row) =>
              //     String(row[filter.id]) === filter.value}
              // title="Order History"
              initialState={{
                sortBy: [{ id: "dateAdded", desc: true }],
                pageSize: 50,
              }}
              columns={columns}
              data={items.filter((item) => item.archived !== 1)}

            />}
          </div>
          {modalData && (
            <Modal isOpen={isModalOpen} title={!editMode ? "Add New Contact" : "Update Case"} toggleModal={handleToggleModal} content={modalContent}>

              <CaseForm
                editing={editMode ? true : false}
                // caseData={{ ...modalData, 'case_indexId': caseId }}
                caseData={modalData}
                patients={patients}
                onAdd={(data) => handleAddItem(data)}
                onUpdate={((data) => handleUpdateItem(data))}
                onCancel={handleToggleModal}
                onRemove={data => handleRemoveItem(data)}
              />

            </Modal>
          )}
        </div>
      </div>

      {/* <div className="w-9/12 content-center items-center justify-center">

        <AlertModal
          isOpen={isCancelModalOpen}
          content={{ modalTitle: 'Are you sure?', modalContent: "By doing this, you will cancel this order and the customer will be notified", confirmText: 'Ok' }}
          toggleModal={() => toggleCancelModal(!isCancelModalOpen)}
          onConfirm={handleCancelOrder}
        />
      </div> */}
    </>

  );

}

export default Contacts