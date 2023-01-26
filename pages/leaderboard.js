const people = [
    {
      name: 'Leonard Krasner',
      handle: 'leonardkrasner',
      imageUrl:
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      name: 'Floyd Miles',
      handle: 'floydmiles',
      imageUrl:
        'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      name: 'Emily Selman',
      handle: 'emilyselman',
      imageUrl:
        'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      name: 'Kristin Watson',
      handle: 'kristinwatson',
      imageUrl:
        'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  ]
  function LayoutHeader  ({children}) {
      return (
  
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-lg px-10 py-8 mx-auto bg-white rounded-lg shadow-xl">
            <div className="max-w-md mx-auto space-y-6">
              {/* Component starts here */}
              <h2 className="flex flex-row flex-nowrap items-center my-8">
                <span className="flex-grow block border-t border-black" aria-hidden="true" role="presentation" />
                <span className="flex-none block mx-4   px-4 py-2.5 text-xs leading-none font-medium uppercase bg-black text-white">
              Leaderboard
                </span>
                <span className="flex-grow block border-t border-black" aria-hidden="true" role="presentation" />
              </h2>
              {/* Component ends here */}
                {children}

            </div>
          </div>
        </div>
      );
    }
  
  export default function Leaderboard() {
    return ( <>
<LayoutHeader>
<div className="flex">
<div className="md:flex-2 sm:flex-1"> </div>
<div className="md:flex-2 sm:flex-3">

<div>
        
        <div className="mt-6 flex-1  flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {people.map((person) => (
              <li key={person.handle} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img className="h-8 w-8 rounded-full" src={person.imageUrl} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="truncate text-sm text-gray-500">{'@' + person.handle}</p>
                  </div>
                  <div>
                    <a
                      href="#"
                      className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      View
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
       
      </div>

</div>
<div className="md:flex-2 sm:flex-1"> </div>
    </div>
</LayoutHeader>
   

    
    </>
      
    )
  }
  