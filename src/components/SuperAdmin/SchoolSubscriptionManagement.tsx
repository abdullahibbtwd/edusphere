import React from 'react'
import { FaSearch } from 'react-icons/fa'

const SchoolSubscriptionManagement = () => {
  return (
    <div className='flex w-full flex-col gap-4 p-4'>
      <div className='flex w-full items-center gap-4 justify-between'>
        <div className='px-4 flex w-1/4 items-center justify-start'>
            <h2 className='text-2xl text-text font-poppins'>
                Schools Management
            </h2>
        </div>
        <div className='p-2 w-1/3 '>
            <div className='w-full px-2 flex items-center gap-2  bg-muted rounded-md  '>
                <FaSearch size={17} />
                <input type="text"  placeholder='Search' className=' w-full h-full text-1xl px-4 py-3 outline-0 '/>
            </div>
        </div>
        <div className='p-2 w-1/3 '>
            <div className='w-full px-2 bg-white '>
                <input type="text"  className='w-full '/>
            </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolSubscriptionManagement
