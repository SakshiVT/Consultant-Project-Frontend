import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import desoContract from '../artifacts/contracts/PostApp.sol/SocialMedia.json'
import FeedHeader from '../components/layouts/components/FeedHeader';
import Feeds from '../components/layouts/components/Feeds';
let provider;
let signer;

if (typeof window !== 'undefined') {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
}

export default function Home() {
  const [allPostData, setAllPostData] = useState([]);

  useEffect(() => {
    getAllPost()
  }, [])

  const getAllPost = async () => {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ADDRESS,
      desoContract.abi,
      signer
    );

    const allPosts = await contract.getAllPosts();
    setAllPostData(allPosts)

    // if(allPosts[10]){
    //   const delPOst = await contract.deletePost(allPosts[10][0])
    //   console.log(delPOst);
    // }

  }


  //Reversing the data for newer post to older post
  const data = allPostData;
  Object.freeze(data);
  const dataReversed = [...data];
  dataReversed.reverse();

  return (
    <div className="flex bg-slate-900 justify-center">
      <div className="w-2/5 border border-gray-600 h-auto  border-t-0">
        {/*middle wall*/}
        <FeedHeader />

        {
          dataReversed.map((post) => {
            if (!(parseInt(post[1]) === 0)) {

              return (

                <Feeds
                  id={post[0]}
                  author={post[1]}
                  content={post[2]}
                  timestamp={post[3]}
                  banCounter={post[4]}
                  isCensored={post[5]}
                  imageURL={post[6]}
                  likeAddress={post[7]}
                  commentAddress={post[8]}
                  comment={post[9]}
                />
              )
            }

          })
        }
      </div>
    </div>

  );
}


