import { ethers } from 'ethers';
import nextBase64 from 'next-base64';
import { useEffect, useState } from "react";
import timeFormator from "./timeFormator";
import desoContract from '../../../artifacts/contracts/PostApp.sol/SocialMedia.json';
import Popup from 'reactjs-popup';
// import {Link} from 'react-router-dom'
import { useNavigate } from "react-router";
import Child from './profileFeedChild';
import { green } from '@mui/material/colors';
let provider;
let signer;

if (typeof window !== 'undefined') {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
}

const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ADDRESS,
    desoContract.abi,
    signer
);

function ProfileFeed(props) {

    const [content, setContent] = useState('');
    const [likeFill, setLikeFill] = useState("none");
    const [address, setAddress] = useState("");
    let [likeCount, setLikeCount] = useState(0);
    let [commentCount, setCommentCount] = useState(0);
    let [likedAddress, setLikedAddress] = useState(0);
    let [score, setScore] = useState(0);
    let [disable, setDisable] = useState({});
    let [tooptiptext, setTooptiptext] = useState();

    let totalLike = props.likeAddress.reduce((total, x) => (parseInt(x) === 0 ? total : total + 1), 0);
    let totalComment = props.commentAddress.reduce((total, x) => (parseInt(x) === 0 ? total : total + 1), 0);

    const getAddress = async () => {
        const account = provider.getSigner();
        const Address = await account.getAddress();
        setAddress(Address)
    }

    useEffect(() => {

        getAddress();
        setLikeCount(totalLike);
        setCommentCount(totalComment);

        let addressList = '';
        props.likeAddress.map((add) => {
            if (parseInt(add) !== 0) {
                addressList += add.slice(0, 6) + "..." + add.slice(39) + ", "
            }
        })
        addressList = addressList.slice(0, -2);
        setLikedAddress(addressList)
        getScore();

        if (props.likeAddress.includes(address)) {
            setLikeFill('white')
        } else {
            setLikeFill('none')
        }
    }, [address])

    async function getContent(content) {
        try {
            if (content) {
                const response = await fetch(content, {
                    method: 'GET'
                })
                const data = await response.json();
                console.log(JSON.stringify(data))
                return data
            }
        } catch (err) {
            console.log(err);
        }
    }

    if (props.content != 'BlankURL' && props.content != 'Blank URL'){
        getContent(props.content).then(res => {
        // console.log(props.author);
        try{
            setContent(nextBase64.decode(res[props.author]))
        } catch (err) {
            setContent(null);
        }
        
    })
    }  

    const getScore = async () => {
        if (address) {
            const score = await contract.scores(address);
            setScore(parseInt(score._hex));
            let styleForDisablity = {}
            if (parseInt(score._hex) > 20) {
                styleForDisablity = { "marginLeft": "-25px" }
                setTooptiptext("")
            } else {
                styleForDisablity = { "marginLeft": "-25px", "pointerEvents": "none" }
                setTooptiptext("Earn 20 points to like")
            }
            setDisable(styleForDisablity);
        }
    }

    let reportSVG;
    if(score && score > 20){
        reportSVG = {"margin":"4px 0 -5px -73px"}
    }else{
        reportSVG = {"margin":"4px 0 -5px -73px", "display":"none"}       
    }

    const likePost = async (arr) => {

        const likePost = await contract.likePost(arr[0], arr[1]);
        const likePostResult = await likePost.wait();
        const isLiked = likePostResult.events[0].args[3];
        if (isLiked) {
            setLikeFill('white');
            setLikeCount(likeCount += 1);


        } else {
            setLikeFill('none');
            setLikeCount(likeCount -= 1);
        }

    }
    const DeletePost = async (arr) => {

        const deletePost = await contract.deletePost(arr[0]);
        const deletePostResult = await deletePost.wait();
        console.log("Your post deleted : ", parseInt(deletePostResult.events[0].args[0]._hex));
    }

    const handleLike = (e, arr) => {
        likePost(arr)
    }
    const handleDelete = (e, arr) => {
        DeletePost(arr)
    }
    // const edit = async (id, content, image) => {
    //     const { history } = this.props;
    //     history.push({
    //         pathname: "/editPost",
    //         state: {
    //             id,
    //             content,
    //             image
    //         },
    //     });
    // }
    const contentStyle = { width: '50%', height: '50%', backgroundcolor: 'white'};
    return (
        <>
            <div className="flex flex-shrink-0 p-4 pb-0">
                {/* <a href="#" className="flex-shrink-0 group block"> */}
                <div className="flex items-center">
                    <div>
                        <img className="inline-block h-10 w-10 rounded-full" src="https://pbs.twimg.com/profile_images/1121328878142853120/e-rpjoJi_bigger.png" alt="" />
                    </div>
                    <div className="ml-3">
                        <p style={{ "lineHeight": "1", "marginTop": "5px" }} className="text-base leading-6 font-medium text-white">
                            {props.author}<br />
                            <span style={{ "fontSize": "11px" }} className="text-sm leading-5 text-gray-400 group-hover:text-gray-300 transition ease-in-out duration-150">
                                {timeFormator(props.timestamp._hex)}
                            </span>

                        </p>
                    </div>
                </div>
                {/* </a> */}
            </div>
            <div className="pl-16">
                {content ?
                    <p style={{ "marginTop": "8px" }} className="text-base width-auto font-medium text-white flex-shrink">
                        {content}
                    </p>
                    : null}
                {
                    props.imageURL != 'BlankURL' && props.imageURL != 'Blank URL' ?
                        <div className="md:flex-shrink pr-6 pt-3">
                            <img className="rounded-lg w-full h-64" src={props.imageURL} alt="Post URL" />
                        </div> : null
                }
                <div className="flex">
                    <div className="w-full">
                        <div className="flex items-center">
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#"
                                    className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </a>
                            </div>
                            <span 
                            style={{ "margin": "5px 145px 0 9px" }}
                             className="text-sm leading-5 text-gray-400 group-hover:text-gray-300 transition ease-in-out duration-150">
                                {commentCount.toString()}
                            </span>
                            <div className="flex-1 text-center py-2 m-2">
                                <div className='likeHeart'>
                                    <a href="#" onClick={(e) => handleLike(e, [props.author, props.id])} style={disable} className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                        <span className='likeHearttooltip'>{tooptiptext}</span>
                                        <svg fill={likeFill} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <span
                                className='likeCounter' >
                                {likeCount.toString()}<span className='likeCountertooltiptext'>{likedAddress}</span>
                            </span>
                            <div className="flex-1 text-center py-2 m-2">

                            <Popup
                                className="popup-content popup-overlay"
                                trigger={<a href={"#"+props.id} className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                <svg className="text-center h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                </a>}
                                                            {...{
                                                                contentStyle,
                                                            }}
                                                            modal
                                                            nested
                                                        >{
                                                                close => {
                                                                    return (
                                                                        <div><button onClick={close} style={{ "border-radius": "20px", "position": "absolute", "top": "10px", "right": "10px", "width": "5%" }} class="btn btn-dark btn-circle btn-sm"> X </button><br /><br /><Child feed = {[props.id,props.content,props.imageURL]}></Child></div>)
                                                                }
                                                            }
                                                        </Popup>
                            
                            {/* <i className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300" 
                            onClick={() => { edit(props.id, props.content, props.imageURL); }} />
                            <svg className="text-center h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> */}
                                
                                {/* <a href="/editPost" style={{ "marginTop": "8px" }} 
                                className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                </a> */}
                                {/* <Link to={{
                                    pathname : "/editPost",
                                    state : {id : props.id,
                                            content : props.content,
                                            image : props.content}
                                }} style={{ "marginTop": "8px" }} className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300"><svg className="text-center h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></Link> */}
                            </div>
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#" onClick={(e) => handleDelete(e, [props.id])} style={{ "marginTop": "8px" }} className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-7" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                </a>
                            </div>
                            {/*
                            <div className="flex-1 text-center py-2 m-2">
                                <a href="#" className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </a>
                            </div>
                            */}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-gray-600" />
        </>
    )
}

export default ProfileFeed

