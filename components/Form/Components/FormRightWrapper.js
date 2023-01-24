import styled from "styled-components";
import { FormState } from "../Form";
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
let pinataUrlString ="";
const axios = require("axios");

const FormRightWrapper = () => {

  const [image, setImage] = useState(null);

  const Handler = useContext(FormState);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const uploadFiles = async (e) => {

      e.preventDefault();
      setUploadLoading(true);

      if(Handler.form.story !== "") {
        try {
          let encodedString = Buffer.from(Handler.form.story, "utf8");
          Handler.setStoryUrl(encodedString.toString("base64"));
          console.log("caption -->"+ encodedString.toString("base64"))
        } catch (error) {
          toast.warn(`Error Uploading Story`);
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
      Handler.setUploaded(true);
      toast.success("Files Uploaded Sucessfully");
  
    }; 
    

    return(
    <FormRight>
      <FormInput>
        <label>Select Image</label>
        <Image
          alt="dapp"
          onChange={(e)=>{setImage(e.target.files[0])}}required
          type={"file"}
          accept="image/*"
        ></Image>
      </FormInput>
      {uploadLoading == true ? (
        <Button>
          <TailSpin color="#fff" height={20} />
        </Button>
      ) : uploaded == false ? (
        <Button onClick={uploadFiles}>Upload Files to IPFS</Button>
      ) : (
        <Button style={{ cursor: "no-drop" }}>
          Files uploaded Sucessfully
        </Button>
      )}
      <Button onClick={(e)=>{Handler.startPost(pinataUrlString)}}>Publish Post</Button>
    </FormRight>
    );
};


const FormRight = styled.div`
  width: 45%;
`;

const FormInput = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "poppins";
  margin-top: 10px;
`;

const Image = styled.input`
  background-color: ${(props) => props.theme.bgDiv};
  color: ${(props) => props.theme.color};
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: large;
  width: 100%;
  &::-webkit-file-upload-button {
    padding: 15px;
    background-color: ${(props) => props.theme.bgSubDiv};
    color: ${(props) => props.theme.color};
    outline: none;
    border: none;
    font-weight: bold;
  }
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 15px;
  color: white;
  background-color: #00b712;
  background-image: linear-gradient(180deg, #00b712 0%, #5aff15 80%);
  border: none;
  margin-top: 30px;
  cursor: pointer;
  font-weight: bold;
  font-size: large;
`;

export default FormRightWrapper;
