import React from "react";
import { ethers } from "ethers";
import desoContract from "../../../artifacts/contracts/PostApp.sol/SocialMedia.json";

let provider;
let signer;

if (typeof window !== "undefined") {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
}

const CommentTag = ({ author, content, id }) => {
  const shortenAddress = (addr) => {
    return `${addr.slice(0, 4)}...${addr.slice(addr.length - 4, addr.length)}`;
  };

  const handleDelete = async () => {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ADDRESS,
      desoContract.abi,
      signer
    );

    // console.log(author, id.toNumber());

    await contract.deleteComment(author, id.toNumber());
    // location.reload();
  };

  return (
    <div className='bg-[#3f4555] rounded-lg w-[90%] p-2 mb-[15px]'>
      <div className='flex flex-row justify-between items-center'>
        <p className='text-white font-semibold text-sm'>
          {shortenAddress(author)}
        </p>

        <button onClick={handleDelete}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='#fff'
            className='w-4 h-4 hover:stroke-slate-300 transition-all duration-150 ease-in-out'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
            />
          </svg>
        </button>
      </div>

      <p className='text-white leading-[20px] text-[13px] mt-[5px]'>
        {content}
      </p>
    </div>
  );
};

export default CommentTag;
