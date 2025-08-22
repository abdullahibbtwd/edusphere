import Image from "next/image"

const UserCard = ({type ,stats} :{ type: string; stats: string | number }) => {
  return (
    <div className='rounded-2xl odd:bg-[#CFCEFF] even:bg-[#FAE27C] p-4 flex-1 min-w-[130px]'>
           <div className="flex justify-between items-center">
            <span className="text-[10px] bg-white px-2 py-1 rounded-full text-gray-600">2024/25</span>
            <Image src="/more.png" className="cursor-pointer active:scale-90" alt="" width={20} height={20}/>
           </div>
           <h1 className="text-2xl font-semibold my-4  "> {stats}</h1>
           <h2 className="capitalize text-sm font-medium text-gray-700" >{type}</h2>

    </div>
  )
}

export default UserCard