import { ethers } from 'ethers';
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

const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ADDRESS,
    desoContract.abi,
    signer
);

function Feeds(props) {

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

    const handleLike = (e, arr) => {
        likePost(arr)
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
                    props.imageURL != 'BlankURL' && props.imageURL != 'Blank URL'?
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
                            {/* <div className="flex-1 text-center py-2 m-2">
                                <a href="#" className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </a>
                            </div> */}
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
                                <a href="#" style={reportSVG} className="w-12 mt-1 group flex items-center text-gray-500 px-3 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
                                    <svg className="text-center h-7 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                </a>
                            </div>
                            {/* 
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
                                */}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-gray-600" />
        </>
    )
}

export default Feeds

