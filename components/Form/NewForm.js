import { createContext, useState, useContext, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Router from 'next/router'
import styled from 'styled-components';
import desoContract from '../../artifacts/contracts/PostApp.sol/SocialMedia.json'
let pinataUrlString = "";
const axios = require("axios");
const FormState = createContext();

export default function Form() {

  const [form, setForm] = useState({
    story: ""
  });

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [storyUrl, setStoryUrl] = useState();
  const [image, setImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(()=>{
    if(storyUrl){
      createPost()
    }
  },[storyUrl])

  const FormHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const startPost = async (e) => {

    e.preventDefault();

    

    if (form.story !== "") {
      try {
        let encodedString = Buffer.from(form.story, "utf8");
        setStoryUrl(encodedString.toString("base64"));
        console.log("caption -->" + encodedString.toString("base64"))
      } catch (error) {
        toast.warn("Error uploading caption");
      }
    }else{
      setStoryUrl('BlankURL')
    }

  }

  const createPost= async()=>{
    setUploadLoading(true);

    let captionUrlString = "BlankURL";

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    //we gather a local file from the API for this example, but you can gather the file from anywhere

    let filedata = new FormData();

    filedata.append('file', image);
    if(image){
      
    const result = await axios({
      method: "post",
      url: url,
      data: filedata,
      headers: {
        "Content-Type": `multipart/form-data`,
        "pinata_api_key": `${process.env.NEXT_PUBLIC_IPFS_ID}`,
        "pinata_secret_api_key": `${process.env.NEXT_PUBLIC_IPFS_KEY}`,
      },
    })
    
    console.log("RESULT  " + JSON.stringify(result));
    let IPFSHASH = result.data.IpfsHash;
    pinataUrlString = `https://gateway.pinata.cloud/ipfs/${IPFSHASH}`;
  }else{
    pinataUrlString = 'BlankURL'
  }
    
    // setUploaded(true);
    // if(setUploaded){

      const textToIpfsUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
      let textToIpfsJson = {
        pinataOptions: {
          cidVersion: 1
        },
        pinataMetadata: {
          name: "",
        },
        pinataContent: {
        }
      };


      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();


      if (storyUrl != '' && storyUrl != undefined && storyUrl.toLowerCase() !== "blankurl")  {
        let address = await signer.getAddress();
        textToIpfsJson.pinataMetadata.name = address + "_caption";
        textToIpfsJson.pinataContent[`${address}`] = storyUrl;

        const result = await axios({
          method: "post",
          url: textToIpfsUrl,
          data: textToIpfsJson,
          headers: {
            "Content-Type": `application/json`,
            "pinata_api_key": `${process.env.NEXT_PUBLIC_IPFS_ID}`,
            "pinata_secret_api_key": `${process.env.NEXT_PUBLIC_IPFS_KEY}`,
          },
        })

        console.log("Result for text Upload",JSON.stringify(result));
        let IPFSHASH = result.data.IpfsHash;
        captionUrlString = `https://gateway.pinata.cloud/ipfs/${IPFSHASH}`;
      }else{
        captionUrlString = "BlankURL";
      }
      
      // if (form.story === "") {
      //   toast.warn("Story Field Is Empty");
      // } else if (pinataUrlString) {
      //   setLoading(true);
        
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_ADDRESS,
          desoContract.abi,
          signer
        );

        const desoData = await contract.createPost(
          captionUrlString,
          pinataUrlString
        );
        console.log(desoData);
        const desoPostResult = await desoData.wait();
        console.log("Deso Result--->", desoPostResult)
        setAddress(desoData.to);
        if (desoPostResult.to) {
          setLoading(false);
          setUploadLoading(false);
          toast.success("Post created Successfully!")
          Router.push('/')
        }
      // }
      return false;
  }

  return (

    <FormState.Provider value={{ form, setForm, setLoading, FormHandler, setStoryUrl, startPost, setUploaded }} >
      {uploadLoading ? 
      <Spinner>
        <TailSpin height={60} />
      </Spinner> : null}
      <form action="#" className="relative">
        <div
          style={{ 'margin': "20px 32px" }}
        >
          <label htmlFor="story" className="sr-only">
            Description
          </label>
          <textarea
            rows={2}
            name="story"
            id="story"
            onChange={FormHandler}
            className="block w-full resize-none border-0 py-0 placeholder-gray-500 focus:ring-0 sm:text-sm"
            placeholder="Write a caption..."
            style={{ "outline": "none", "fontSize": "15px" }}
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
            style={{ "margin": "0 15px" }}
            className="flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
            <div className="flex">
              <input
                type="file"
                alt="dapp"
                id='actual-btn'
                onChange={(e) => { setImage(e.target.files[0]) }}
                required
                accept="image/*"
                style={{ "fontSize": "12px" }}
                className="group -my-2 -ml-2 inline-flex items-center rounded-full px-3 py-2 text-left text-gray-400"
                hidden={true}
              />

            </div>
            <div className="flex-shrink-0">
              <button
                type="submit"
                onClick={startPost}
                style={{ "fontSize": "12px", "height": "30px" }}
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

const Spinner = styled.div`
    position:fixed;
    width:100%;
    left:0;right:0;top:0;bottom:0;
    background-color: rgba(255,255,255,0.7);
    display:flex ;
    justify-content:center ;
    align-items:center ;
    z-index:9999;
`