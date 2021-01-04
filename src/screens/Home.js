import React, { useMemo, useState, useEffect, useContext } from 'react'
import { format, parse, differenceInYears, isValid } from 'date-fns'
// import { CSVLink, CSVDownload } from "react-csv";
// import axios from 'axios'
import swal from 'sweetalert';
import firebase from "../config/firebase";

import { AuthContext } from '../context/Auth'

import Table from '../components/ReactTable'
import Modal from '../components/Modal'
// import AlertModal from '../components/AlertModal'
import CaseForm from '../components/CaseForm'

// import * as yup from 'yup';
// import useYup from '@usereact/use-yup'

import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

import ReactExport from "react-data-export";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;




// const validationSchema = yup.object().shape({
//   order_cost: yup.number().min(0).required(),
//   order_status: yup.string().required()
// });

const Dashboard = (props) => {

  const auth = useContext(AuthContext);
  const { currentUser } = auth
  // console.log(currentUser)

  const [items, setItems] = React.useState([]);
  const [filters, setFilters] = React.useState([]);
  const [caseInfo, selectCase] = React.useState(null);
  // const [orderList, setOrderList] = React.useState([]);
  // const [formValues, setFormValues] = React.useState({ cost: '', status: '' });
  const [filterText, setFilterText] = useState('')
  const [indexChecked, toggleIndexChecked] = useState(true)
  const [isModalOpen, toggleModal] = React.useState(false);
  // const [isCancelModalOpen, toggleCancelModal] = React.useState(false);
  const [modalContent, setModalContent] = React.useState('');

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

  // const handleChange = e => {
  //   const { name, value } = e.target

  //   validate();
  //   setFormValues({
  //     ...formValues,
  //     [name]: value
  //   });
  // }

  const fetchData = async () => {

    // setOrderList([])
    const db = firebase.firestore();
    const data = await db.collection('cases_2021').orderBy('dateAdded', 'desc').get();
    // console.log(data)
    setItems(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));

  };

  useEffect(() => {
    console.log('fetch data')
    // console.log(exportData)
    fetchData()
  }, [props])

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
        await db.collection("cases_2021").doc(newItemID)
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

      // setItems([...items, { id: newItemID, name: newItem, quantity: 1 }])
    }

    toggleModal(!isModalOpen)
    fetchData()
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
            await db.collection("cases_2021").doc(caseObj.id).update({ archived: 1 });
            toggleModal(!isModalOpen)
            fetchData()
          } catch (error) {
            // alert(error);
            console.error(error)
            // setFormError('Sorry but we do not recognize that email/password combination. Please try again')
          }
        }


      });
  }

  const handleUpdateItem = async (caseObj) => {

    const db = firebase.firestore();
    // const newItemID = guid();
    // console.log(caseObj)
    if (caseObj) {

      caseObj.updatedBy = currentUser.email
      caseObj.dateUpdated = format(new Date(), 'yyyy-MM-dd HH:mm')
      try {
        // await db.collection("customers").doc(currentUser.uid).collection('cart').add({ name: newItem, quantity: 1 });
        await db.collection("cases_2021").doc(caseObj.id).update(caseObj);

      } catch (error) {
        // alert(error);
        console.error(error)
        // setFormError('Sorry but we do not recognize that email/password combination. Please try again')
      }
      // setItems([...items, { id: newItemID, name: newItem, quantity: 1 }])
    }

    toggleModal(!isModalOpen)
    fetchData()
    // setNewItem('')

  };

  const handleModifyCases = () => {
    // console.log('users', users_data.length)
    // const admin_id = 'TzLz92WY4kMh6T4mQoFwYRw5hU72'
    // const admin_email = 'karen.broome@health.gov.bb'
    // let i = 0;
    // items.map(async (elem) => {
    //   // elem.find()
    //   if (elem.addedBy) {
    //     console.log(elem.addedBy, elem.author)
    //     const userData = users_data.find((user) => user.localId === elem.addedBy)
    //     // console.log(userData.localId, userData.email)
    //     i++
    //     elem.author = userData.email
    //     // await handleUpdateItem(elem)
    //   } else {

    //     elem.addedBy = admin_id
    //     elem.author = admin_email
    //     // await handleUpdateItem(elem)
    //   }


    // })
    // console.log('number of users', i)

  }

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
  }

  // This is a custom filter UI for selecting
  // a unique option from a list
  function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
      const options = new Set()
      preFilteredRows.forEach(row => {
        options.add(row.values[id])
      })
      return [...options.values()]
    }, [id, preFilteredRows])

    // Render a multi-select box
    return (
      <div className="inline-block relative">
        <select
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          value={filterValue}
          onClick={e => e.stopPropagation()}
          onChange={e => {
            setFilter(e.target.value || undefined)
          }}
        >
          <option value="">All</option>
          {options.map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </div>
      </div>
    )
  }




  const columns = useMemo(
    () => [

      {
        Header: "#",
        disableFilters: true,
        accessor: (row, i) => i + 1,
      },
      {
        Header: "Date",
        accessor: "dateAdded",
        // Cell: (row, data) => (<div className='p-1'>{format(new Date(row.row.original.dateAdded), 'PPpp')}</div>),
        Cell: (row, data) => (<div className='p-1'>{row.row.original.dateAdded}</div>),
        disableFilters: true,
        filterMethod: (filter, row) =>
          row[filter.id].startsWith(filter.value) &&
          row[filter.id].endsWith(filter.value)
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
        id: "symptoms",
        accessor: d => d.case_symptoms?.map((item => item.label)).join(', '),
        // accessor: "case_symptoms",
        // disableFilters: true,
        // Cell: (row, data) => <ul>{row.row.original.case_symptoms.map(item => <li>{item.label},</li>)}</ul>,
        // Cell: (row, data) => { return (row.row.original.case_symptoms.length > 0 ? <ul>{row.row.original.case_symptoms.map((item, index) => <li key={index}>{item.label},</li>)}</ul> : <span></span>) },
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
      // {
      //   Header: "Mobile #",
      //   accessor: "case_mobile_number",

      // },
      {
        Header: "Visited",
        id: "country",
        accessor: d => d.case_country ? d.case_country.map((item => item.label)).join(', ') : '',
        // accessor: "case_country",
        // disableFilters: true,
        // // Cell: (row, data) => {
        // //   return {
        // //     row.row.original.case_country.length > 0 ? <ul>{row.row.original.case_country.map(item => <li>{item.label},</li>)}</ul> : <span></span>
        // //   }
        // // },
        // Cell: (row, data) => { return (row.row.original.case_country && row.row.original.case_country.length > 0 ? <ul>{row.row.original.case_country.map((item, index) => <li key={index}>{item.label},</li>)}</ul> : <span></span>) },
        // // width: 200,
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
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: "Status",
        id: "case_status",
        accessor: d => d.case_status ? d.case_status.trim().toLowerCase() : '',
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      // {
      //   Header: "Index Case",
      //   accessor: "case_indexId",
      // },
      {
        Header: "Isolation",
        accessor: "case_isolation_center",
        Cell: row => { return (<div style={row.row.original.case_indexId === 0 ? styles.highlightCell : {}}>{row.row.original.case_isolation_center}</div>) },
        Filter: SelectColumnFilter,
        filter: 'includes',
        // filterMethod: (filter, row) =>
        //   row[filter.id].startsWith(filter.value) &&
        //   row[filter.id].endsWith(filter.value)

      },
      {
        Header: "Condition",
        id: "case_current_condition",
        accessor: d => d.case_current_condition ? d.case_current_condition.trim().toLowerCase() : '',
        // accessor: "case_current_condition",
        // Cell: row => { return (<div style={row.row.original.case_current_condition ? styles.highlightCell : {}}>{row.row.original.case_current_condition}</div>) },
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ cell: { row } }) => (
          <div className="flex justify-between p-3">
            <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs py-2 px-2 mx-3 rounded shadow"
              onClick={() => {
                console.log(row.original);
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

  const cases = items
  // console.log(cases)
  // console.log(columns.map((item) => console.log(item)))
  // console.log('cases', items)

  const tableColumns = ["case_address", "case_age", "case_birthdate", "case_catchment_area", "case_conditions", "case_country", "case_current_condition", "case_exposure_date", "case_exposure_location", "case_gender", "case_home_number", "case_indexCase", "case_living_partners", "case_mobile_number", "case_name", "case_nationality", "case_notes", "case_quarantine_location", "case_status", "case_symptoms", "dateAdded", "quarantine_period", "id", "case_isolation_center", "case_quarantine_period", "case_releasedate", "case_symptom_date", "addedBy", "archived", "case_symtpom_date"]
  // const tableColumns = ["case_address", "case_age", "case_birthdate"]

  const exportData = items.filter((item) => item.archived !== 1)
    .map((item) => {

      let countryList, symptomsList, conditionsList, nationalityList

      if (Array.isArray(item.case_country)) {
        countryList = item.case_country.map((item) => item.label).join(',')
      }
      if (Array.isArray(item.case_symptoms)) {
        symptomsList = item.case_symptoms.map((item) => item.label).join(',')
      }

      if (Array.isArray(item.case_conditions)) {
        conditionsList = item.case_conditions.map((item) => item.label).join(',')
      }

      if (Array.isArray(item.case_nationality)) {
        nationalityList = item.case_nationality.map((item) => item.label).join(',')
      }

      return {
        ...item,
        // case_indexCase: item.case_indexId.length > 0 ? cases.filter((elem) => elem.id === item.case_indexId)[0].case_name : '',
        case_indexCase: item.case_indexId && item.case_indexId.length > 0 ?
          item.case_indexId
            .split(',')
            .map((caseIndex) => {
              // console.log(caseIndex)
              // caseIndex.case_indexId.join(',')
              // console.log(cases.filter((elem) => elem.id === caseIndex))
              return (cases.filter((elem) => elem.id === caseIndex)[0]?.case_name)
            }

            )
            .join(',')
          // .map((caseIndex) =>
          //   // console.log(caseIndex.case_indexId)
          //   caseIndex.case_indexId.join(',')
          //   // cases.find((elem) => elem.id === caseIndex.case_indexId).case_name
          // )
          : '',
        case_country: countryList,
        case_symptoms: symptomsList,
        case_conditions: conditionsList,
        case_nationality: nationalityList
      }
    })
  // console.log('export data', exportData)

  console.log('filter dates', filters, items)

  return (
    <>
      <div className="flex my-6">

        <div className="w-full p-2 h-50">
          <div className="flex justify-between mb-3">
            <h4 className="font-semibold">List of Index Cases</h4>
            <div>
              {/* <button className="bg-yellow-400 py-2 px-4 rounded shadow text-sm text-white mx-3" onClick={handleModifyCases}>Modify Cases</button> */}
              <button className="px-4 py-2 mt-3 font-medium text-white bg-blue-500 rounded hover:bg-blue-700 md:ml-6 md:mt-0 text-sm leading-tight" onClick={handleToggleModal}>Add New Case</button>
              {currentUser.admin && <ExcelFile
                filename={'Export_Contact_Tracing_' + format(new Date(), 'yyyy-MM-ddHH:mm')}
                element={<button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-sm py-2 px-2 rounded shadow">Export Data</button>}
              >
                <ExcelSheet data={exportData} name="Patient Cases">
                  {tableColumns.map((elem, index) => <ExcelColumn key={index} label={elem} value={elem} />)}
                </ExcelSheet>
              </ExcelFile>}

            </div>
          </div>
          <div>
            {items &&
              <>
                <div className='flex flex-row justify-start items-center'>
                  <div className="w-4/12">
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      name="filterText"
                      value={filterText}
                      onChange={e => setFilterText(e.target.value)}
                      placeholder={"Search for a case by name"}
                    />
                  </div>
                  <div className='w-4/12'>
                    <div>
                      <Flatpickr
                        // data-enable-time
                        placeholder="Click to filter between dates"
                        className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={filters.filterDates}
                        // maxDate={'2020-04-03'}
                        // options={{ maxDate: format(new Date(), 'yyyy-MM-dd') }}
                        options={{ mode: 'range' }}
                        // onChange={date => { console.log(date[0], date[1]) }}
                        onChange={date => setFilters(prevStyle => ({
                          ...prevStyle,
                          'filterDates': date
                        }))}
                      />

                    </div>

                  </div>
                  <div className="w-1/12">
                    <button className="bg-transparent p-2 text-sm text-blue-500 mx-1" onClick={() => setFilters([])}>Reset Dates</button>
                  </div>
                  <div className="w-2/12">
                    <div className="px-3 content-center justify-center items-center">
                      <label className="block text-gray-500 font-normal">
                        <input type="checkbox" checked={indexChecked} className="leading-loose text-pink-600" onChange={handleIndexChecked} />
                        <span className="text-sm text-gray-600"> Index Cases Only </span>
                      </label>
                    </div>
                  </div>
                </div>


                <Table
                  columns={columns}
                  initialState={{
                    sortBy: [{ id: "dateAdded", desc: true }],
                    pageSize: 50,
                  }}
                  data={items
                    .filter((item) => item.archived !== 1)
                    .filter((item) => indexChecked ? item.case_indexId === 0 : item)
                    .filter((item) => item.case_name.toLowerCase().includes(filterText))
                    .filter((item) => filters && filters.filterDates?.length > 1 ? Date.parse(item.dateAdded) < Date.parse(filters.filterDates[1]) && Date.parse(item.dateAdded) > Date.parse(filters.filterDates[0]) : item)
                  }
                />
              </>}
          </div>

          {caseInfo && (<Modal isOpen={isModalOpen} title={Object.entries(caseInfo).length === 0 ? "Add New Case" : "Update Case"} toggleModal={handleToggleModal} content={modalContent}>

            <CaseForm
              editing={Object.entries(caseInfo).length > 0 ? true : false}
              caseData={caseInfo}
              patients={items.filter((item) => item.archived !== 1)}
              onAdd={(data) => handleAddItem(data)}
              onUpdate={((data) => handleUpdateItem(data))}
              // onCancel={handleToggleModal}
              onRemove={data => handleRemoveItem(data)}
            />

          </Modal>
          )}


        </div>
      </div>


    </>
  );

}

const styles = {
  highlightCell: { backgroundColor: 'red', padding: '1em', margin: 0, color: '#fff', height: '100%', width: '100%' }
}

export default Dashboard