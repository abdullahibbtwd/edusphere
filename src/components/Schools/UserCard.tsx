import Image from "next/image"

const UserCard = ({ type, stats, sessionName }: { type: string; stats: string | number; sessionName?: string }) => {
  return (
    <div className='rounded-2xl odd:bg-[#8B5CF6] even:bg-[#F59E0B] p-4 flex-1 min-w-[130px]'>
           <div className="flex justify-between items-center">
            <span className="text-[10px] px-2 py-1 rounded-full text-gray-100">{sessionName ?? "—"}</span>
           </div>
           <h1 className="text-2xl font-semibold my-4  "> {stats}</h1>
           <h2 className="capitalize text-sm font-medium" >{type}</h2>

    </div>
  )
}

export default UserCard