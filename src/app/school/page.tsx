
import Banner from '@/components/Banner/Banner'
import Campus from '@/components/Campus/Campus'
import Contact from '@/components/Contact/Contact'
import Facilities from '@/components/Facilities/Facilities'
import Footer from '@/components/Footer/Footer'
import Hero from '@/components/HeroSchool/Hero'
import Subjects from '@/components/Subjects/Subject'
import React from 'react'

const page = () => {
  return (
     <div className="flex w-full justify-center overflow-x-hidden">
       <div className="min-h-screen max-w-[1266px] gap-16 w-full ">
    <Hero/>
    <Subjects/>
    <Banner/>
    <Facilities/>
    <Campus/>
    <Contact/>
    <Footer/>
    </div>
    </div>
   
  )
}

export default page
