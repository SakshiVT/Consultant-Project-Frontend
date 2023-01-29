import { ethers } from 'ethers';
import axios from "axios"
import nextBase64 from 'next-base64';
import { useEffect, useState } from "react";
import timeFormator from "./timeFormator";
import desoContract from '../../../artifacts/contracts/PostApp.sol/SocialMedia.json'
let provider;
let signer;

if (typeof window !== 'undefined') {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
}

function Feeds(props) {

    const [content, setContent] = useState('');
    const [likeFill, setLikeFill] = useState("none");

    useEffect(()=>{
        if(!props.likeAddress.includes[props.author]){
            setLikeFill('none')
        }else{
            setLikeFill('white')
        }
    },[])

    async function getContent(content) {
        try{
            if(content){
                const response = await fetch(content,{
                    method:'GET'
                })
                const data = await response.json();
                return data
            }
        }catch (err){
            console.log(err);
        }
    }

    getContent(props.content).then(res =>{ 
        setContent( nextBase64.decode(res[props.author]))
    })

    const likePost = async (arr) => {
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_ADDRESS,
          desoContract.abi,
          signer
        );
            
        const likePost = await contract.likePost(arr[0],arr[1]);
        if(likePost){
            (likeFill==='none')?setLikeFill('white'):setLikeFill("none")
        }
        return likePost
    
      }

    const handleLike = (e,arr) => {
        if(!props.likeAddress.includes[arr[0]]){
            setLikeFill('none')
        }else{
            setLikeFill('white')
        }
        console.log(likePost(arr))
    }
    
    return (
        <>
            <div className="flex flex-shrink-0 p-4 pb-0">
                {/* <a href="#" className="flex-shrink-0 group block"> */}
                    <div className="flex items-center">
                        <div>
                            <img className="inline-block h-10 w-10 rounded-full" src="https://pbs.twimg.com/profile_images/1121328878142853120/e-rpjoJi_bigger.png" alt="" />
                        </div>
                        <div className="ml-3">
                            <p style={{"lineHeight":"1", "marginTop":"5px"}} className="text-base leading-6 font-medium text-white">
                                {props.author}<br />
                                <span style={{"fontSize":"11px"}} className="text-sm leading-5 text-gray-400 group-hover:text-gray-300 transition ease-in-out duration-150">
                                    {timeFormator(props.timestamp._hex)}
                                </span>
                            </p>
                        </div>
                    </div>
                {/* </a> */}
            </div>
            <div className="pl-16">
                {content?
                <p style={{"marginTop":"8px"}} className="text-base width-auto font-medium text-white flex-shrink">
                    {content}
                </p>
                :null}
                {
                    props.imageURL ?
                        <div className="md:flex-shrink pr-6 pt-3">
                            <img className="rounded-lg w-full h-64" src={props.imageURL} alt="Post URL" />
                        </div> : null
                }
                <div className="flex">
                    <div className="w-full">
                        <div className="flex items-center">
                            <div className="flex-1 text-center">
                                <a href="#" className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </a>
                            </div>
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#" className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </a>
                            </div>
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#" onClick={(e)=>handleLike(e,[props.author,props.id])} className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill={likeFill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </a>
                            </div>
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#" className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </a>
                            </div>
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#" className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" /></svg>
                                </a>
                            </div>
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#" className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-gray-600" />
        </>
    )
}

export default Feeds
