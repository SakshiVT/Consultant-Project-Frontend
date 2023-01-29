import React from "react";

const CommentTag = ({ author, content }) => {
  const shortenAddress = (addr) => {
    return `${addr.slice(0, 4)}...${addr.slice(addr.length - 4, addr.length)}`;
  };

  return (
    <div className='bg-[#3f4555] rounded-lg w-[90%] p-2'>
      <p className='text-white font-semibold text-sm'>
        {shortenAddress(author)}
      </p>

      <p className='text-white leading-[20px] text-[13px] mt-[5px]'>
        {content}
      </p>
    </div>
  );
};

export default CommentTag;
