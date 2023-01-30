import {ethers} from 'ethers';
import desoContract from '../artifacts/contracts/PostApp.sol/SocialMedia.json'
import { useEffect, useState } from 'react';
import { FormatUnderlined } from '@mui/icons-material';
import { blue } from '@mui/material/colors';


export default function History() {

    async function getTransactionHistory() {

        const providers = new ethers.providers.Web3Provider(window.ethereum);
        const signer = providers.getSigner();
    
        const walletAddress = await signer.getAddress(); // address of the wallet
    
        const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/");
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS, desoContract.abi, provider);
        // const contractBlock = await contract.functions.blockNumber().then((block) => block.toNumber());
    
        // const latestBlock = await provider.getBlockNumber();
        // console.log(latestBlock);
        // console.log(contractBlock);
      
        const logs = await provider.getLogs({
            fromBlock: 31559000,
            toBlock: 31560000,  
            address: process.env.NEXT_PUBLIC_ADDRESS,
            topics: ["0x9d91b7482dd982821504c296f70b1c0bcddcae924036bc04ec6b137fd830f305"],
            //   topics: [ethers.utils.id("NewPost(address,string,uint)")],
        });
    
        console.log(logs);
      
        // const transactions = logs.map((log) => {
        //   const transferEvent = contract.interface.parseLog(log);
        //   return {
        //     // from: transferEvent.values._from,
        //     // to: transferEvent.values._to,
        //     // value: transferEvent.values._value,
        //   };
        // });
      
        setAllUserPostData(logs);
      }


    const [allUserPostData, setAllUserPostData] = useState([]);
    useEffect(() => {
        getTransactionHistory();
    }, [])
    

    // const contractAddress = process.env.NEXT_PUBLIC_ADDRESS; // address of the contract
    // const blockNumber = 31535918;
    // const result =  getTransactionHistory(blockNumber, contractAddress)
    // .then((transactions) => {
    //   console.log(transactions)
    // })
    // .catch((error) => {
    //   console.error(error);
    // });
    

    return (<><div><h1>History</h1>
    <br/>
    <h1>Create Post</h1>



    <td style={{border: "1px solid black"}}>
    <th style={{border: "1px solid black"}}>blockNumber</th>
        {
        
        allUserPostData.map((transactions)=>{      return(
        <><div>
            <tr>{transactions.blockNumber}</tr>
        </div></>    
        )})

    }
    </td>
    <td style={{border: "1px solid black"}}>
    <th style={{border: "1px solid black"}}>blockHash</th>
        {
        
        allUserPostData.map((transactions)=>{      return(
        <><div>
            <tr>{transactions.blockHash}</tr>
        </div></>    
        )})

    }
    </td>
    <td style={{border: "1px solid black"}}>
    <th style={{border: "1px solid black"}}>address</th>
        {
        
        allUserPostData.map((transactions)=>{      return(
        <><div>
            <tr>{transactions.address}</tr>
        </div></>    
        )})

    }
    </td>
    <td style={{border: "1px solid black"}}>
    <th style={{border: "1px solid black"}}>transactionHash</th>
        {
        
        allUserPostData.map((transactions)=>{    return(
        <><div>
            <tr><a  href={'https://mumbai.polygonscan.com/tx/'+transactions.transactionHash} target='_blank'><u style={{color: "green"}}>{'https://mumbai.polygonscan.com/tx/'+transactions.transactionHash}</u></a></tr>   
        </div></>    
        )})

    }
    </td>
    </div></>);

}