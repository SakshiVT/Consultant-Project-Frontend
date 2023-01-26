/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
// import { Fragment, useState } from 'react'
// import styled from 'styled-components';
import { Listbox, Transition } from '@headlessui/react'
import { CalendarIcon, PaperClipIcon, TagIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import FormLeftWrapper from './Components/FormLeftWrapper'
import FormRightWrapper from './Components/FormRightWrapper'
import { createContext, useState,  useContext  } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import desoContract from '../../artifacts/contracts/PostApp.sol/SocialMedia.json'
import styled from "styled-components";
// import { FormState } from "../Form";
let pinataUrlString ="";
const axios = require("axios");
const FormState = createContext();

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Form() {

  const [form, setForm] = useState({
    title: '',
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [formUrl, setFormUrl] = useState({
    titleURL:"",
    descURL:''
  });
  const [image, setImage] = useState(null);
  const Handler = useContext(FormState);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleDescription = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleTitle = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }



  const uploadFiles = async (e) => {

      e.preventDefault();
      setUploadLoading(true);
      console.log(form)

      if(form.title !== "") {
        try {
          let encodedString = Buffer.from(form.title, "utf8");
          setFormUrl({
            ...formUrl,
            titleURL: encodedString.toString("base64")});
          console.log("caption -->"+ encodedString.toString("base64"))
        } catch (error) {
          toast.warn(`Error Uploading Title`);
        }
      }

      if(form.description !== "") {
        try {
          let encodedString = Buffer.from(form.description, "utf8");
          setFormUrl({
            ...formUrl,
            descURL: encodedString.toString("base64")});
          console.log("caption -->"+ encodedString.toString("base64"))
        } catch (error) {
          toast.warn(`Error Uploading Description`);
        }
      }
      

      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      //we gather a local file from the API for this example, but you can gather the file from anywhere

      let filedata = new FormData();

      filedata.append('file', image);
   
      const result = await axios({
        method:"post",
        url:url,
        data:filedata,
        headers: {
          "Content-Type": `multipart/form-data`,
          "pinata_api_key": `${process.env.NEXT_PUBLIC_IPFS_ID}`,
          "pinata_secret_api_key": `${process.env.NEXT_PUBLIC_IPFS_KEY}`,
        },
      })

      console.log("RESULT  "+JSON.stringify(result));
      let IPFSHASH = result.data.IpfsHash;
      pinataUrlString = `https://gateway.pinata.cloud/ipfs/${IPFSHASH}`;

      setUploadLoading(false);
      setUploaded(true);
      // Handler.setUploaded(true);
      toast.success("Files Uploaded Sucessfully");
  
    }; 

  const startPost = async (e,pinataUrlString) => {
    console.log(pinataUrlString)
    e.preventDefault();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    console.log("caption in post contract -->" + formUrl)

    if (form.title === "") {
      toast.warn("Title Field Is Empty");
    } else if (uploaded == false) {
      toast.warn("Files Upload Required")
    }
    if (form.description === "") {
      toast.warn("Description Field Is Empty");
    } else if (uploaded == false) {
      toast.warn("Files Upload Required")
    }
    else {
      setLoading(true);

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ADDRESS,
        desoContract.abi,
        signer
      );

      const desoData = await contract.createPost(
        formUrl,
        pinataUrlString
      );

      const desoPostResult = await desoData.wait();
      console.log("Deso Result--->" + desoPostResult)

      toast.success("Post Uploaded Successfuly!")
      setAddress(desoData.to);
    }

    // return false;
  }

  return (

    <FormState.Provider value={{ form, setForm,setLoading,uploadFiles, handleDescription, handleTitle, startPost, setUploaded }} >

      <form action="#" className="relative">
        <div 
        // className="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        style={{'margin':"15px 32px"}}
        >
          <label htmlFor="title" className="sr-only">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            onChange={handleTitle}
            value={form.title}
            className="block w-full text-lg font-medium placeholder-gray-500"
            style={{"outline":"none"}}
            placeholder="Title"
          />
          <label htmlFor="description" className="sr-only">
            Description
          </label>
          <textarea
            rows={5}
            name="description"
            id="description"
            onChange={handleDescription}
            className="block w-full resize-none border-0 py-0 placeholder-gray-500 focus:ring-0 sm:text-sm"
            placeholder="Write a description..."
            style={{"outline":"none"}}
            defaultValue={''}
          />
          
          <div aria-hidden="true">
            <div className="py-2">
              <div className="h-9" />
            </div>
            <div className="h-px" />
            <div className="py-2">
              <div className="py-px">
                <div className="h-9" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-px bottom-0">
          <div
          style={{"margin":"0 15px"}} 
          className="flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
            <div className="flex">
              <input
                type="file"
                alt="dapp"
                id='actual-btn'
                onChange={(e) => { setImage(e.target.files[0]) }}
                required
                accept="image/*"
                className="group -my-2 -ml-2 inline-flex items-center rounded-full px-3 py-2 text-left text-gray-400"
                hidden={true}
              />
                {/* <PaperClipIcon className="-ml-1 mr-2 h-5 w-5 group-hover:text-gray-500" aria-hidden="true" /> */}
                {/* <span for='actual-btn'style={{"cursor":"pointer"}} className="text-sm italic text-gray-500 group-hover:text-gray-600">Attach a file</span> */}
            </div>
            <div className="flex-shrink-0">
                <button 
                onClick={uploadFiles}
                style={{"marginRight":"8px"}}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Upload Files to IPFS
                </button>
                <button
                type="submit"
                onClick={(e)=>{startPost(e,pinataUrlString)}}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                Create
              </button>
              
              
                
            </div>
          </div>
        </div>
      </form>
    </FormState.Provider>
  )
}
