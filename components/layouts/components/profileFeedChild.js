import React from "react";

const Child = (feed)=>{


    console.log(feed.feed)
    return(
        <>
        {/* <div
          style={{ 'margin': "20px 32px" }}
        >
          <label htmlFor="story" className="sr-only">
            Description
          </label>
          <textarea
            rows={2}
            name="story"
            id="story"
            className="block w-full resize-none border-0 py-0 placeholder-gray-500 focus:ring-0 sm:text-sm"
            style={{ "outline": "none", "fontSize": "15px" }}
            defaultValue={feed.feed[1]}
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
        </div> */}
        
        <div style={{backgroundColor: "white"}}>{feed.feed[1]}</div>
        
        <div style={{backgroundColor: "white"}}>{feed.feed[2]}</div>
        </>
    )

}

export default Child