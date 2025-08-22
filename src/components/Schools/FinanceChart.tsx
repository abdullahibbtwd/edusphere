"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Jan',
    income: 4000,
    expenses: 2400,
    
  },
  {
    name: 'Feb',
    income: 3000,
    expenses: 1398,
    
  },
  {
    name: 'Mar',
    income: 2000,
    expenses: 9800,
    
  },
  {
    name: 'Apr',
    income: 2780,
    expenses: 3908,
    
  },
  {
    name: 'May',
    income: 1890,
    expenses: 4800,
    
  },
  {
    name: 'Jun',
    income: 2390,
    expenses: 3800,
    
  },
  {
    name: 'Jul',
    income: 3490,
    expenses: 4300,
    
  },
  {
    name: 'Aug',
    income: 3490,
    expenses: 4300,
    
  },
  {
    name: 'Sep',
    income: 3490,
    expenses: 4300,
    
  },
  {
    name: 'Oct',
    income: 3490,
    expenses: 4300,
    
  },
  {
    name: 'Nov',
    income: 3490,
    expenses: 4300,
    
  },
  {
    name:'Dec',
    income: 3490,
    expenses: 4300,
    
  },
];


import Image from "next/image"

const FinanceChart = () => {
  return (
    <div className=' bg-white rounded-lg p-4 h-full'>
         {/* Title */}
                <div className='flex justify-between items-center '>
               <h1 className='text-lg font-semibold'>Finance</h1>
                 <Image src="/moreDark.png" alt='' width={20} height={20}/>
                </div>
    <ResponsiveContainer width="100%" height="85%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} stroke='#ddd' />
          <XAxis tickMargin={20} dataKey="name" axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false} />
          <YAxis tickMargin={20} axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false}/>
          <Tooltip />
          <Legend  align='center' verticalAlign='top' wrapperStyle={{paddingTop:"15px",paddingBottom:"30px"}}/>
          
          <Line type="monotone" dataKey="income" stroke="#FAE27C" strokeWidth={5} />
          <Line type="monotone" dataKey="expenses" stroke="#C3EBFA" strokeWidth={5}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FinanceChart