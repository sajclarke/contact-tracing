import React, { useState, useContext, useEffect } from 'react'
import { format, compareAsc, parse, differenceInCalendarYears, differenceInYears, isValid } from 'date-fns'
// import isValid from 'date-fns/is_valid'
import InputMask from "react-input-mask";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';
import countryList from 'react-select-country-list'
import swal from 'sweetalert';

import "flatpickr/dist/themes/material_green.css";

import Flatpickr from "react-flatpickr";

import firebase from "../config/firebase";
import { AuthContext } from "../context/Auth.js";

import * as yup from 'yup';
import useYup from '@usereact/use-yup'

// const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
const phoneRegExp = /^((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}$/
const dateStringRegExp = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/
const validationSchema = yup.object().shape({
    case_name: yup.string().required('Name is required'),
    case_exposure_location: yup.string(),
    case_exposure_date: yup.string(),
    // case_exposure_date: yup.string().matches(dateStringRegExp, 'Exposure Date is not valid'),
    // case_exposure_date: yup.date(),
    // case_exposure_date: yup.date().typeError('Invalid date').required('Exposure Date is required'),
    case_nationality: yup.string(),
    case_country: yup.string(),
    case_symptoms: yup.string().required('Symptoms are required'),
    case_symptom_date: yup.string(),
    case_quarantine_location: yup.string(),
    case_birthdate: yup.string(),
    case_releasedate: yup.string(),
    // case_birthdate: yup.date().typeError('Invalid date'),
    case_gender: yup.string().required('Gender is required'),
    case_home_number: yup.string(),
    case_mobile_number: yup.string(),
    case_address: yup.string().required('Address is required'),
    case_catchment_area: yup.string(),
    case_living_partners: yup.string(),
    case_conditions: yup.string(),
    case_notes: yup.string(),
});

const CaseForm = (props) => {

    let countryOptions = countryList().getData()

    console.log(countryOptions)
    // console.log(props.caseData.case_name)

    const polyclinics = [
        'Winston Scott Polyclinic',
        'Randal Phillips Polyclinic',
        'Eunice Gibson Polyclinic',
        'Branford Taitt Polyclinic',
        'Edgar Cochrane Polyclinic',
        'St Philip Polyclinic',
        'Maurice Byer Polyclinic',
        'Glebe Polyclinic',
        'St John Polyclinic',
    ]

    const isolation_centers = [
        'No',
        'Home',
        'Campus 1 (Enmore)',
        'Campus 2 (Paragon)',
        'Campus 3 (School)',
        'Campus 4 (Harrison Pt)'
    ]

    const symptoms = [
        'none', 'fever', 'sore throat', 'muscle pain/muscle aches', 'shortness of breath', 'cough', 'loss of taste', 'loss of smell', 'loss of appetite', 'body ache', 'malaise', 'headache', 'diarrhea', 'nausea', 'vomiting', 'abdominal pain'
    ]
    const cormorbidities = [
        'none', 'asthma/COPD', 'cancer', 'diabetes', 'HIV', 'hypertension', 'obesity', 'cardiovascular disease', 'substance abuse', 'pneumonia', 'auto-immune disease'
    ]

    let arr_symptoms = symptoms.map((item) => ({ value: item, label: item }))
    let arr_comorbidities = cormorbidities.map((item) => ({ value: item, label: item }))

    // let arr_patients = []


    const testObj = {
        case_name: 'Joe Brown',
        case_country: [{ value: 'JP', label: 'Japan' }],
        case_exposure_location: 'Restaurant',
        case_exposure_date: '',
        case_symptoms: [{ value: 'cough', label: 'Cough' }],
        case_indexId: 0,
        case_birthdate: '1989-05-22',
        case_gender: 'Male',
        case_home_number: '246-437-4297',
        case_mobile_number: '246-111-1111',
        case_address: 'Random place in the gully',
        case_conditions: [{ value: 'hypertension', label: 'Hypertension' }],
        case_notes: 'Something goes here',
    }

    const defaultObj = {
        case_name: '',
        case_country: '',
        case_nationality: '',
        case_exposure_location: '',
        case_exposure_date: '',
        case_symptoms: '',
        case_indexId: 0,
        case_current_condition: '',
        case_symptom_date: '',
        case_quarantine_location: '',
        case_quarantine_period: '',
        case_isolation_center: '',
        case_birthdate: '',
        case_age: '',
        case_gender: '',
        case_home_number: '',
        case_mobile_number: '',
        case_address: '',
        case_catchment_area: '',
        case_living_partners: '',
        case_conditions: '',
        case_notes: '',
        case_status: '',
    }

    const [values, setValues] = useState(defaultObj)
    const [patientOptions, setPatientOptions] = useState([])
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    const { errors, validate } = useYup(values, validationSchema, {
        validateOnChange: true
    })

    const { currentUser } = useContext(AuthContext);


    useEffect(() => {

        let patientDB = props.patients
        setPatientOptions(patientDB.map((item) => ({ value: item.id, label: item.case_name })));

        // console.log(props.caseData)
        setValues(Object.entries(props.caseData).length > 0 ? props.caseData : defaultObj);


    }, [props]);


    const handleChange = e => {
        let { name, value } = e.target

        setValues({
            ...values,
            [name]: value
        });
        //TODO:Add input masking on the telephone numbers
        validate();
    }

    const handleSubmit = async () => {

        console.log('submit profile info', values)
        validate()
        console.log(Object.entries(errors).length, errors)
        // return;

        if (Object.entries(errors).length < 1) {

            //TODO: Check if there are any duplicates (by matching on name)
            const db = firebase.firestore();
            const data = await db.collection('cases').where('case_name', '==', values.case_name.trim()).get();
            // const duplicates = data.docs.map(doc => ({ case_name: doc.data().case_name, birthdate: doc.data().case_birthdate, case_age: doc.data().case_age, id: doc.id }))
            const duplicates = data.docs.map(doc => ({ ...doc.data(), id: doc.id }))
            console.log(duplicates.filter(item => item.archived != 1))
            // return;
            if (duplicates.length > 0) {
                swal({
                    title: "Are you sure?",
                    text: "There's another patient with the same name. Click ok if you still want to add this record!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                })
                    .then(async (value) => {
                        // console.log(value)
                        if (value) {
                            try {
                                if (props.editing) {
                                    props.onUpdate(values)
                                } else {
                                    props.onAdd(values)
                                }
                            } catch (error) {

                            }
                        }
                    });
            } else {
                if (props.editing) {
                    props.onUpdate(values)
                } else {
                    props.onAdd(values)
                }
            }


        } else {
            swal("Missing fields!", "You forgot to enter one or more fields", "error");
        }

    }

    // const handleDeceasedChecked = () => {
    //     console.log(indexChecked)
    //     toggleIndexChecked(!indexChecked)
    //     console.log(indexChecked)
    //     if (!indexChecked) {
    //         console.log('checked')
    //         // setItems(items.filter((item) => item.case_indexId === 0))
    //     } else {
    //         // setItems(items)
    //     }


    // }
    console.log(values)
    return (

        <>
            {formSuccess && (
                <div class="bg-teal-100 border-t-1 border-teal-500 rounded-b text-teal-900 px-4 py-3 mb-3 shadow-md" role="alert">
                    <div class="flex">
                        <div class="py-1"><svg class="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
                        <div>
                            <p class="font-bold">Success!</p>
                            <p class="text-sm">{formSuccess}</p>
                        </div>
                    </div>
                </div>
            )}
            {formError && (
                <div class="w-100 m-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-3 rounded relative" role="alert">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline"> {formError}</span>
                </div>
            )}
            <div className='text-left'>
                <form className="w-full max-w-lg">
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-2/4 px-3 mb-3 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Name
                            </label>
                            {/* <input type="text" placeholder="Enter your full name" name="case_name" value={values.case_name} onClick={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" /> */}
                            <input
                                type="text"
                                name="case_name"
                                className="px-3 py-3 placeholder-gray-400 bg-gray-200 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                                placeholder="Enter your full name"
                                value={values.case_name} onChange={e => handleChange(e)}
                                style={{ transition: "all .15s ease" }}
                            />
                            {errors.case_name && (<p className="text-red-500 text-xs italic">{errors.case_name}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Gender
                            </label>
                            <div className="relative">
                                <select name="case_gender" value={values.case_gender} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"  >
                                    <option value=''>--Select One--</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>

                            {errors.case_gender && (<p className="text-red-500 text-xs italic">{errors.case_gender}</p>)}
                        </div>


                    </div>
                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                What Symptoms do they have?
                            </label>
                            {/* <textarea name="case_symptoms" value={values.case_symptoms} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="Do they have existing conditions?" rows="3"></textarea> */}
                            {/* <select name="case_symptoms" value={values.case_symptoms} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" >
                                <option>--Select One--</option>
                                {symptoms.map((item) => <option>{item}</option>)}
                            </select> */}
                            <CreatableSelect
                                isMulti
                                name="case_symptoms"
                                placeholder="Select from options or type ..."
                                options={arr_symptoms}
                                value={values.case_symptoms}
                                onChange={value => setValues({
                                    ...values,
                                    'case_symptoms': value
                                })}
                            />
                            {errors.case_symptoms && (<p className="text-red-500 text-xs italic">{errors.case_symptoms}</p>)}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Address
                            </label>
                            <textarea name="case_address" value={values.case_address} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="Where are they residing locally?" rows="3"></textarea>
                            {errors.case_address && (<p className="text-red-500 text-xs italic">{errors.case_address}</p>)}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Do they have an index case?
                            </label>

                            <Select
                                // isMulti
                                name="case_indexId"
                                placeholder="Select from options ..."
                                options={[{ label: "No", value: 0 }, ...patientOptions]}
                                // value={values.case_indexId}
                                value={values.case_indexId == 0 ? { label: "No", value: 0 } : patientOptions.filter((item) => item.value === values.case_indexId)}
                                onChange={value => {
                                    console.log(value);
                                    setValues({
                                        ...values,
                                        'case_indexId': value.value
                                    })
                                }}
                            />
                            {errors.case_indexId && (<p className="text-red-500 text-xs italic">{errors.case_indexId}</p>)}
                        </div>
                    </div>

                    {/* {props.editing && ( */}
                    <div className="flex flex-wrap mt-2 mb-6">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Test Results
                                </label>
                            <div className="relative">
                                <select name="case_status" value={values.case_status} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" >
                                    <option value=''>--Select One--</option>
                                    <option>pending</option>
                                    <option>positive</option>
                                    <option>negative</option>
                                </select>
                            </div>
                            {errors.case_status && (<p className="text-red-500 text-xs italic">{errors.case_status}</p>)}
                        </div>
                        <div class="w-full md:w-2/4 px-3 mb-3 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Condition
                            </label>
                            <div className="relative">
                                <select name="case_current_condition" value={values.case_current_condition} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"  >
                                    <option value=''>--Select One--</option>
                                    <option>Deceased</option>
                                    <option>Stable</option>
                                    <option>Critical</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* )} */}


                    <div className="flex flex-wrap my-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                                Place of Exposure
                            </label>
                            <input
                                type="text"
                                name="case_exposure_location"
                                className="px-3 py-3 placeholder-gray-400 bg-gray-200 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                                placeholder="Name of location"
                                value={values.case_exposure_location} onChange={e => handleChange(e)}
                                style={{ transition: "all .15s ease" }}
                            />
                            {errors.case_exposure_location && (<p className="text-red-500 text-xs italic">{errors.case_exposure_location}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Date of Exposure
                            </label>
                            {/* <input name="case_exposure_date" value={values.case_exposure_date} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="YYYY-MM-DD" /> */}
                            <Flatpickr
                                name="case_exposure_date"
                                placeholder="YYYY-MM-DD"
                                className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                value={values.case_exposure_date}
                                options={{ allowInput: true }}
                                // options={{ maxDate: format(new Date(), 'yyyy-MM-dd') }}
                                // onChange={date => console.log(format(date[0], 'yyyy-MM-dd'))}
                                // onChange={date => console.log(
                                //     values
                                // )}
                                onClose={data => console.log(data)}
                                onValueUpdate={data => console.log(data)}
                                onChange={date => {
                                    validate();
                                    console.log(date)
                                    setValues(prevStyle => ({
                                        ...prevStyle,
                                        'case_exposure_date': date.length > 0 ? format(date[0], 'yyyy-MM-dd') : ''
                                    }));

                                }}
                            />
                            {errors.case_exposure_date && (<p className="text-red-500 text-xs italic">{errors.case_exposure_date}</p>)}
                        </div>
                    </div>
                    <div className="flex flex-wrap mb-2">
                        <div className="w-full mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
                                Countries recently visited (in last 30 days)
                            </label>


                            <CreatableSelect
                                isMulti
                                name="case_country"
                                placeholder="Select from options or type ..."
                                options={[{ label: "None", value: "none" }, ...countryOptions]}
                                value={values.case_country}
                                onChange={value => setValues({
                                    ...values,
                                    'case_country': value
                                })}
                            />


                            {errors.case_country && (<p className="text-red-500 text-xs italic">{errors.case_country}</p>)}
                        </div>

                    </div>

                    <div className="flex flex-wrap my-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                                Onset of Symptoms?
                        </label>
                            {/* <InputMask mask="9999-99-99" name="case_symptom_date" value={values.case_symptom_date} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="YYYY-MM-DD" /> */}
                            <Flatpickr
                                // data-enable-time
                                placeholder="YYYY-MM-DD"
                                className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                value={values.case_symptom_date}
                                // maxDate={'2020-04-03'}
                                // options={{ maxDate: format(new Date(), 'yyyy-MM-dd') }}
                                options={{ mode: "single", maxDate: 'today' }}
                                onChange={date => setValues(prevStyle => ({
                                    ...prevStyle,
                                    'case_symptom_date': date.length > 0 ? format(date[0], 'yyyy-MM-dd') : ''
                                }))}
                            />
                            {errors.case_symptom_date && (<p className="text-red-500 text-xs italic">{errors.case_symptom_date}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Are they Isolated?
                            </label>
                            <div className="relative">
                                <select name="case_isolation_center" value={values.case_isolation_center} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"  >
                                    <option value=''>--Select One--</option>
                                    {isolation_centers.map((item, index) => <option key={index}>{item}</option>)}
                                    {/* <option>Home</option>
                                    <option>Paragon</option>
                                    <option>No</option> */}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>

                            {errors.case_isolation_center && (<p className="text-red-500 text-xs italic">{errors.case_isolation_center}</p>)}
                        </div>
                        <div className="w-full px-3 my-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Did they quarantine?
                            </label>
                            <div className="relative">
                                <select name="case_quarantine_location" value={values.case_quarantine_location} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"  >
                                    <option value=''>--Select One--</option>
                                    {['Yes', 'No'].map((item, index) => <option key={index}>{item}</option>)}
                                    {/* <option>Home</option>
                                    <option>Paragon</option>
                                    <option>No</option> */}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>

                            {errors.case_quarantine_location && (<p className="text-red-500 text-xs italic">{errors.case_quarantine_location}</p>)}
                        </div>
                        <div className="w-full px-3 my-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Quarantine Period?
                            </label>
                            <div className="relative">
                                <Flatpickr
                                    // data-enable-time
                                    placeholder="YYYY-MM-DD"
                                    className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    value={values.case_quarantine_period}
                                    // maxDate={'2020-04-03'}
                                    // options={{ maxDate: format(new Date(), 'yyyy-MM-dd') }}
                                    options={{ mode: 'range' }}
                                    // onChange={date => { console.log(date[0], date[1]) }}
                                    onChange={date => setValues(prevStyle => ({
                                        ...prevStyle,
                                        'quarantine_period': date[0] && date[1] ? format(date[0], 'yyyy-MM-dd') + ' to ' + format(date[1], 'yyyy-MM-dd') : ''
                                    }))}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>

                            {errors.case_quarantine_period && (<p className="text-red-500 text-xs italic">{errors.case_quarantine_period}</p>)}
                        </div>
                    </div>
                    <div className="flex flex-wrap my-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                                BirthDate
                            </label>
                            {/* <InputMask mask="9999-99-99" name="case_birthdate" value={values.case_birthdate} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="YYYY-MM-DD" /> */}
                            <Flatpickr
                                // data-enable-time
                                placeholder="YYYY-MM-DD"
                                className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                value={values.case_birthdate}
                                // options={{ allowInput: true }}
                                onClose={date => setValues(prevStyle => ({
                                    ...prevStyle,
                                    'case_birthdate': date.length > 0 ? format(date[0], 'yyyy-MM-dd') : ''
                                }))}
                                onValueUpdate={date => {
                                    console.log(isValid(date[0]));
                                    console.log(differenceInYears(new Date(), date[0]));
                                    setValues(prevStyle => ({
                                        ...prevStyle,
                                        'case_age': isValid(date[0]) ? parseInt(differenceInYears(new Date(), date[0])) : ''
                                    }))
                                }}
                                // options={{ maxDate: format(new Date(), 'yyyy-MM-dd') }}
                                onChange={date => setValues(prevStyle => ({
                                    ...prevStyle,
                                    'case_birthdate': date.length > 0 ? format(date[0], 'yyyy-MM-dd') : ''
                                }))}
                            />
                            {errors.case_birthdate && (<p className="text-red-500 text-xs italic">{errors.case_birthdate}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Age
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="200"
                                name="case_age"
                                className="px-3 py-3 placeholder-gray-400 bg-gray-200 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                                placeholder="Enter age"
                                value={values.case_age}
                                onChange={e => handleChange(e)}
                                style={{ transition: "all .15s ease" }}
                            />
                            {/* <div className="relative">
                                <select name="case_gender" value={values.case_gender} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"  >
                                    <option value=''>--Select One--</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div> */}

                            {errors.case_age && (<p className="text-red-500 text-xs italic">{errors.case_age}</p>)}
                        </div>
                    </div>
                    <div className="flex flex-wrap my-2">
                        <div className="w-full px-3 my-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                                Home Telephone
                            </label>
                            {/* <InputMask mask="(999) 999-9999" name="case_home_number" value={values.case_home_number} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="(246) 123-4567" /> */}
                            <PhoneInput
                                name="case_home_number"
                                value={values.case_home_number}
                                // onChange={e => console.log(e)}
                                onChange={value => setValues({
                                    ...values,
                                    'case_home_number': value ? value : ''
                                })}
                                className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                type="text"
                                placeholder="Enter home number"
                            />
                            {errors.case_home_number && (<p className="text-red-500 text-xs italic">{errors.case_home_number}</p>)}
                        </div>
                        <div className="w-full px-3 my-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Mobile Telephone
                        </label>
                            {/* <InputMask mask="(999) 999-9999" name="case_mobile_number" value={values.case_mobile_number} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="(246) 123-4567" /> */}
                            <PhoneInput
                                name="case_mobile_number"
                                value={values.case_mobile_number}
                                // onChange={e => console.log(e)}
                                onChange={value => setValues({
                                    ...values,
                                    'case_mobile_number': value ? value : ''
                                })}
                                className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                type="text"
                                placeholder="Enter mobile number"
                            />
                            {errors.case_mobile_number && (<p className="text-red-500 text-xs italic">{errors.case_mobile_number}</p>)}
                        </div>
                    </div>


                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Nationality
                            </label>
                            {/* <textarea name="case_nationality" value={values.case_nationality} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="What is their nationality?" rows="3"></textarea> */}
                            <CreatableSelect
                                isMulti
                                name="case_nationality"
                                placeholder="Select from options or type ..."
                                options={[{ label: "None", value: "none" }, ...countryOptions]}
                                value={values.case_nationality}
                                onChange={value => setValues({
                                    ...values,
                                    'case_nationality': value
                                })}
                            />
                            {errors.case_nationality && (<p className="text-red-500 text-xs italic">{errors.case_nationality}</p>)}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Who are they living with?
                            </label>
                            <textarea
                                name="case_living_partners"
                                value={values.case_living_partners}
                                onChange={e => handleChange(e)}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                placeholder="Who are they living with?"
                                rows="3">
                            </textarea>
                            {errors.case_living_partners && (<p className="text-red-500 text-xs italic">{errors.case_living_partners}</p>)}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Catchment Area
                            </label>
                            <div className="relative">
                                <select name="case_catchment_area" value={values.case_catchment_area} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" >
                                    <option value=''>--Select One--</option>
                                    {polyclinics.map((item, index) => <option key={index}>{item}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                            {errors.case_catchment_area && (<p className="text-red-500 text-xs italic">{errors.case_catchment_area}</p>)}
                        </div>
                    </div>


                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Any Pre-Existing Conditions?
                            </label>
                            {/* <textarea name="case_conditions" value={values.case_conditions} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="Do they have existing conditions?" rows="3"></textarea> */}
                            <CreatableSelect
                                isMulti
                                name="case_conditions"
                                placeholder="Select from options or type ..."
                                options={arr_comorbidities}
                                value={values.case_conditions}
                                onChange={value => setValues({
                                    ...values,
                                    'case_conditions': value
                                })}
                            />
                            {errors.case_conditions && (<p className="text-red-500 text-xs italic">{errors.case_conditions}</p>)}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Additional Notes
                            </label>
                            <textarea name="case_notes" value={values.case_notes} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="Any additional notes?" rows="3"></textarea>
                            {errors.case_notes && (<p className="text-red-500 text-xs italic">{errors.case_notes}</p>)}
                        </div>
                    </div>

                    <div className="w-full px-2">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                            Date of Release
                        </label>
                        {/* <InputMask mask="9999-99-99" name="case_birthdate" value={values.case_birthdate} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="YYYY-MM-DD" /> */}
                        <Flatpickr
                            // data-enable-time
                            placeholder="YYYY-MM-DD"
                            className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            value={values.case_releasedate}
                            // options={{ allowInput: true }}
                            onClose={date => setValues(prevStyle => ({
                                ...prevStyle,
                                'case_releasedate': date.length > 0 ? format(date[0], 'yyyy-MM-dd') : ''
                            }))}

                            // options={{ maxDate: format(new Date(), 'yyyy-MM-dd') }}
                            onChange={date => setValues(prevStyle => ({
                                ...prevStyle,
                                'case_releasedate': date.length > 0 ? format(date[0], 'yyyy-MM-dd') : ''
                            }))}
                        />
                        {errors.case_releasedate && (<p className="text-red-500 text-xs italic">{errors.case_releasedate}</p>)}
                    </div>

                    {/* <div className="flex justify-end"> */}
                    <div className={"flex" + (currentUser.admin ? " justify-between" : " justify-end")}>
                        {currentUser.admin && (
                            <button
                                type="button"
                                className="bg-transparent text-red-500 hover:bg-red-700 hover:text-white font-bold py-2 px-4 mt-5 rounded"
                                onClick={() => props.onRemove(values)}
                            >
                                Delete
                            </button>
                        )}

                        <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-5 rounded" onClick={handleSubmit}>
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}

export default CaseForm