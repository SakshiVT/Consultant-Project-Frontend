import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import desoContract from '../artifacts/contracts/PostApp.sol/SocialMedia.json'
import FeedHeader from '../components/layouts/components/FeedHeader';
import ProfileFeed from '../components/layouts/components/ProfileFeed';
let Address;
let provider;
let signer;

export default function profilePage() {
    const [allUserPostData, setAllUserPostData] = useState([]);

  useEffect(() => {
    getAllPost()
  }, [])

  const getAllPost = async () => {

    if (typeof window !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        Address = await signer.getAddress();
    }
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ADDRESS,
      desoContract.abi,
      signer
    );

    const allPosts = await contract.getAllPosts();
    setAllUserPostData(allPosts)
  }

  //Reversing the data for newer post to older post
  const data = allUserPostData;
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
            if ((parseInt(post[1]) == Address)) {
                console.log(JSON.stringify(post));

              return (

                <ProfileFeed
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