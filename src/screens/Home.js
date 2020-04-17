import React, { useMemo, useState, useEffect, useContext } from 'react'
import { format, compareAsc, parse, differenceInCalendarYears, differenceInYears, isValid } from 'date-fns'
import { CSVLink, CSVDownload } from "react-csv";
import axios from 'axios'
import swal from 'sweetalert';
import firebase from "../config/firebase";

import { AuthContext } from '../context/Auth'

import Table from '../components/ReactTable'
import Modal from '../components/Modal'
import AlertModal from '../components/AlertModal'
import CaseForm from '../components/CaseForm'

import * as yup from 'yup';
import useYup from '@usereact/use-yup'

import ReactExport from "react-data-export";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const dataSet1 = [
  {
    name: "Johson",
    amount: 30000,
    sex: 'M',
    is_married: true
  },
  {
    name: "Monika",
    amount: 355000,
    sex: 'F',
    is_married: false
  },
  {
    name: "John",
    amount: 250000,
    sex: 'M',
    is_married: false
  },
  {
    name: "Josef",
    amount: 450500,
    sex: 'M',
    is_married: true
  }
];

var dataSet2 = [
  {
    name: "Johnson",
    total: 25,
    remainig: 16
  },
  {
    name: "Josef",
    total: 25,
    remainig: 7
  }
];


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
    const data = await db.collection('cases').orderBy('dateAdded', 'desc').get();
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
        await db.collection("cases").doc(newItemID).set({ ...caseObj, addedBy: currentUser.uid, dateAdded: format(new Date(), 'yyyy-MM-dd HH:mm') });
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

  // This is a custom UI for our 'between' or number range
  // filter. It uses two number boxes and filters rows to
  // ones that have values between the two
  function NumberRangeColumnFilter({
    column: { filterValue = [], preFilteredRows, setFilter, id },
  }) {
    const [min, max] = React.useMemo(() => {
      let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
      let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
      preFilteredRows.forEach(row => {
        min = Math.min(row.values[id], min)
        max = Math.max(row.values[id], max)
      })
      return [min, max]
    }, [id, preFilteredRows])

    // const filters = () => {
    //   let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    //   let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    //   preFilteredRows.forEach(row => {
    //     min = Math.min(row.values[id], min)
    //     max = Math.max(row.values[id], max)
    //   })
    //   return [min, max]
    // }
    // const min = 9
    // const max = 80
    // console.log(filters)
    return (
      <div
        style={{
          display: 'flex',
        }}
      >
        <input
          value={filterValue[0] || ''}
          type="number"
          onChange={e => {
            const val = e.target.value
            setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
          }}
          placeholder={`Min (${min})`}
          style={{
            width: '70px',
            marginRight: '0.5rem',
          }}
        />
        to
      <input
          value={filterValue[1] || ''}
          type="number"
          onChange={e => {
            const val = e.target.value
            setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
          }}
          placeholder={`Max (${max})`}
          style={{
            width: '70px',
            marginLeft: '0.5rem',
          }}
        />
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
        Cell: (row, data) => (<div className='p-1'>{format(new Date(row.row.original.dateAdded), 'PPpp')}</div>),
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

      },
      {
        Header: "Symptoms",
        id: "symptoms",
        accessor: d => d.case_symptoms.map((item => item.label)).join(', '),
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
        accessor: "case_status",
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: "Isolation",
        accessor: "case_isolation_center",
        Cell: row => { return (<div style={row.row.original.case_indexId == 0 ? styles.highlightCell : {}}>{row.row.original.case_isolation_center}</div>) },
        Filter: SelectColumnFilter,
        filter: 'includes',
        // filterMethod: (filter, row) =>
        //   row[filter.id].startsWith(filter.value) &&
        //   row[filter.id].endsWith(filter.value)

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
  console.log(cases)
  console.log(columns.map((item) => console.log(item)))
  console.log('cases', items)

  const tableColumns = ["case_address", "case_age", "case_birthdate", "case_catchment_area", "case_conditions", "case_country", "case_current_condition", "case_exposure_date", "case_exposure_location", "case_gender", "case_home_number", "case_indexCase", "case_living_partners", "case_mobile_number", "case_name", "case_nationality", "case_notes", "case_quarantine_location", "case_status", "case_symptoms", "dateAdded", "quarantine_period", "id", "case_isolation_center", "case_quarantine_period", "case_releasedate", "case_symptom_date", "addedBy", "archived", "case_symtpom_date"]
  // const tableColumns = ["case_address", "case_age", "case_birthdate"]

  const exportData = items.filter((item) => item.archived != 1)
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
        case_indexCase: item.case_indexId.length > 0 ?
          item.case_indexId
            .split(',')
            .map((caseIndex) => {
              // console.log(caseIndex)
              // caseIndex.case_indexId.join(',')
              // console.log(cases.filter((elem) => elem.id === caseIndex))
              return (cases.filter((elem) => elem.id === caseIndex)[0].case_name)
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
  console.log('export data', exportData)
  return (
    <>
      <div className="flex my-16">

        <div className="w-full p-2 h-50">
          <div className="flex justify-between mb-3">
            <h4 className="font-semibold">List of Index Cases</h4>
            <div>
              <button className="bg-blue-500 py-2 px-4 rounded shadow text-sm text-white mx-3" onClick={handleToggleModal}>Add New Case</button>
              <ExcelFile
                filename={'Export_Contact_Tracing_' + format(new Date(), 'yyyy-MM-ddHH:mm')}
                element={<button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-sm py-2 px-2 rounded shadow">Download Data</button>}
              >
                <ExcelSheet data={exportData} name="Patient Cases">
                  {tableColumns.map((elem, index) => <ExcelColumn key={index} label={elem} value={elem} />)}
                  {/* <ExcelColumn label="Name" value="name" />
                  <ExcelColumn label="Wallet Money" value="amount" />
                  <ExcelColumn label="Gender" value="sex" />
                  <ExcelColumn label="Marital Status"
                    value={(col) => col.is_married ? "Married" : "Single"} /> */}
                </ExcelSheet>
                {/* <ExcelSheet data={dataSet2} name="Leaves">
                  <ExcelColumn label="Name" value="name" />
                  <ExcelColumn label="Total Leaves" value="total" />
                  <ExcelColumn label="Remaining Leaves" value="remaining" />
                </ExcelSheet> */}
              </ExcelFile>
              {/* <CSVLink
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold text-sm py-2 px-2 rounded shadow"
                data={exportData}
                filename={'Export_Contact_Tracing_' + format(new Date(), 'yyyy-MM-ddHH:mm')}
              >
                Export
              </CSVLink> */}
            </div>
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
                  }}
                  data={items.filter((item) => item.archived != 1).filter((item) => indexChecked ? item.case_indexId == 0 : item).filter((item) => item.case_name.toLowerCase().includes(filterText))}
                />
              </>}
          </div>

          {caseInfo && (<Modal isOpen={isModalOpen} title={Object.entries(caseInfo).length === 0 ? "Add New Case" : "Case Details"} toggleModal={handleToggleModal} content={modalContent}>

            <CaseForm
              editing={Object.entries(caseInfo).length > 0 ? true : false}
              caseData={caseInfo}
              patients={items.filter((item) => item.archived != 1)}
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