import React, { useState, useContext, useEffect } from 'react'
import InputMask from "react-input-mask";
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';
import countryList from 'react-select-country-list'
import "flatpickr/dist/themes/material_green.css";

import Flatpickr from "react-flatpickr";

import firebase from "../config/firebase";
import { AuthContext } from "../context/Auth.js";

import * as yup from 'yup';
import useYup from '@usereact/use-yup'

// const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
const phoneRegExp = /^((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}$/
const validationSchema = yup.object().shape({
    case_name: yup.string().required('Name is required'),
    case_exposure_location: yup.string().required('Location is required'),
    case_exposure_date: yup.date().typeError('Invalid date').required('Date is required'),
    case_country: yup.string().required('Country is required'),
    case_symptoms: yup.string().required('Symptoms are required'),
    case_symptom_date: yup.date().typeError('Invalid date').required('Date is required'),
    case_quarantine_location: yup.string(),
    case_birthdate: yup.date().typeError('Invalid date'),
    case_gender: yup.string().required('Gender is required'),
    case_home_number: yup.string().matches(phoneRegExp, 'Home number is not valid'),
    case_mobile_number: yup.string().matches(phoneRegExp, 'Mobile number is not valid'),
    case_address: yup.string().required('Address is required'),
    case_catchment_area: yup.string(),
    case_living_partners: yup.string(),
    case_conditions: yup.string(),
    case_notes: yup.string(),
});

const CaseForm = (props) => {

    let countryOptions = countryList().getData()
    // console.log(props.caseData.case_name)

    const polyclinics = [
        'Winston Scott Polyclinic',
        'Randall Philips Polyclinic',
        'Eunice Gibson Polyclinic',
        'Branford Taitt Polyclinic',
        'Edgar Cochrane Polyclinic',
        'St Philip Polyclinic',
        'Maurice Byer Polyclinic',
        'Glebe Polyclinic',
        'St John Polyclinic',
    ]

    const symptoms = [
        'fever', 'sore throat', 'shortness of breath', 'cough', 'loss of taste', 'loss of smell', 'body ache', 'malaise', 'headache', 'diarrhea', 'nausea', 'vomitting', 'abdominal pain'
    ]
    const cormorbidities = [
        'asthma/COPD', 'cancer', 'diabetes', 'HIV', 'hypertension', 'obesity', 'cardiovascular disease', 'substance abuse'
    ]

    let arr_symptoms = symptoms.map((item) => ({ value: item, label: item }))
    let arr_comorbidities = cormorbidities.map((item) => ({ value: item, label: item }))


    const defaultObj = {
        // case_name: 'Joe Brown',
        // case_country: [{ value: 'JP', label: 'Japan' }],
        // case_exposure_location: 'Restaurant',
        // case_exposure_date: '2017-09-05',
        // case_symptoms: [{ value: 'cough', label: 'Cough' }],
        // case_birthdate: '1989-05-22',
        // case_gender: 'Male',
        // case_home_number: '246-437-4297',
        // case_mobile_number: '246-111-1111',
        // case_address: 'Random place in the gully',
        // case_conditions: [{ value: 'hypertension', label: 'Hypertension' }],
        // case_notes: 'Something goes here',
        case_name: '',
        case_country: '',
        case_exposure_location: '',
        case_exposure_date: '',
        case_symptoms: '',
        case_symptom_date: '',
        case_quarantine_location: '',
        case_birthdate: '',
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
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    const { errors, validate } = useYup(values, validationSchema, {
        validateOnChange: true
    })

    const { currentUser } = useContext(AuthContext);


    useEffect(() => {
        console.log(props.caseData)
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

    const handleSaveProfile = () => {
        console.log('submit profile info', values)
        validate()
        // console.log(errors)
        // return;

        if (props.editing) {
            props.onUpdate(values)
        } else {
            props.onAdd(values)
        }

        // const db = firebase.firestore();
        // const ref = db.collection("customers").doc(currentUser.uid)
        // try {
        //     await ref.set(values)

        //     setFormSuccess('Thanks your information has been successfully updated')

        // } catch (error) {
        //     // alert(error);
        //     console.error(error)
        //     setFormError('Sorry but we do not recognize that email/password combination. Please try again')
        // }
    }
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
                        <div className="w-full px-3 mb-3 md:mb-0">
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

                    </div>

                    {props.editing && (
                        <div className="flex flex-wrap mt-2 mb-6">
                            <div className="w-full px-3 mb-6 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                    Status/Outcome
                                </label>
                                <div className="relative">
                                    <select name="case_status" value={values.case_status} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" >
                                        <option>--Select One--</option>
                                        <option>pending</option>
                                        {/* <option>follow-up</option> */}
                                        <option>positive</option>
                                        <option>negative</option>
                                    </select>
                                </div>
                                {errors.case_status && (<p className="text-red-500 text-xs italic">{errors.case_status}</p>)}
                            </div>
                        </div>
                    )}


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
                            {/* <InputMask mask="9999-99-99" name="case_exposure_date" value={values.case_exposure_date} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="YYYY-MM-DD" /> */}
                            <Flatpickr
                                // allowInput
                                placeholder="YYYY-MM-DD"
                                className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                value={values.case_exposure_date}
                                // onValueInput={(e, date) => setValues({
                                //     ...values,
                                //     'case_exposure_date': date
                                // })}
                                onChange={(e, date) => setValues({
                                    ...values,
                                    'case_exposure_date': date
                                })}
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
                                options={countryOptions}
                                value={values.case_country}
                                onChange={value => setValues({
                                    ...values,
                                    'case_country': value
                                })}
                            />


                            {errors.case_country && (<p className="text-red-500 text-xs italic">{errors.case_country}</p>)}
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
                                onChange={(e, date) => setValues({
                                    ...values,
                                    'case_symptom_date': date
                                })}
                            />
                            {errors.case_symptom_date && (<p className="text-red-500 text-xs italic">{errors.case_symptom_date}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Are they Quarantined?
                        </label>
                            <div className="relative">
                                <select name="case_quarantine_location" value={values.case_quarantine_location} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" >
                                    <option>--Select One--</option>
                                    <option>Home</option>
                                    <option>Paragon</option>
                                    <option>No</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>

                            {errors.case_quarantine_location && (<p className="text-red-500 text-xs italic">{errors.case_quarantine_location}</p>)}
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
                                onChange={(e, date) => setValues({
                                    ...values,
                                    'case_birthdate': date
                                })}
                            />
                            {errors.case_birthdate && (<p className="text-red-500 text-xs italic">{errors.case_birthdate}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Gender
                        </label>
                            <div className="relative">
                                <select name="case_gender" value={values.case_gender} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" >
                                    <option>--Select One--</option>
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
                    <div className="flex flex-wrap my-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                                Home Telephone
                        </label>
                            <InputMask mask="(999) 999-9999" name="case_home_number" value={values.case_home_number} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="(246) 123-4567" />
                            {errors.case_home_number && (<p className="text-red-500 text-xs italic">{errors.case_home_number}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Mobile Telephone
                        </label>
                            <InputMask mask="(999) 999-9999" name="case_mobile_number" value={values.case_mobile_number} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="(246) 123-4567" />
                            {errors.case_mobile_number && (<p className="text-red-500 text-xs italic">{errors.case_mobile_number}</p>)}
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

                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Who are they living with?
                            </label>
                            <textarea name="case_living_partners" value={values.case_living_partners} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="Where are they residing locally?" rows="3"></textarea>
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
                                    <option>--Select One--</option>
                                    {polyclinics.map((item) => <option>{item}</option>)}
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

                    {/* <div className="flex flex-wrap my-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                                Quarantine Start
                        </label>
                            <InputMask mask="9999-99-99" name="case_birthdate" value={values.case_birthdate} onChange={e => handleChange(e)} className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="YYYY-MM-DD" />
                            {errors.case_birthdate && (<p className="text-red-500 text-xs italic">{errors.case_birthdate}</p>)}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                Quarantine End
                        </label>
                            <div className="relative">
                                <select name="case_gender" value={values.case_gender} onChange={e => handleChange(e)} className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" >
                                    <option>--Select One--</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>

                            {errors.case_gender && (<p className="text-red-500 text-xs italic">{errors.case_gender}</p>)}
                        </div>
                    </div> */}

                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-2">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                Additional Notes
                            </label>
                            <textarea name="case_notes" value={values.case_notes} onChange={e => handleChange(e)} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="Any additional notes?" rows="3"></textarea>
                            {errors.case_notes && (<p className="text-red-500 text-xs italic">{errors.case_notes}</p>)}
                        </div>
                    </div>


                    <div className="flex justify-between">
                        <button type="button" className="bg-transparent hover:bg-red-700 text-white font-bold py-2 px-4 mt-5 rounded" onClick={props.onCancel}>
                            Cancel
                    </button>

                        <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-5 rounded" onClick={handleSaveProfile}>
                            Save Changes
                    </button>
                    </div>

                </form>
            </div>
        </>
    );
}

export default CaseForm