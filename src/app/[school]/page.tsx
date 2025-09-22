
import About from '@/components/About/About'
import Banner from '@/components/Banner/Banner'
import Campus from '@/components/Campus/Campus'
import Contact from '@/components/Contact/Contact'
import Facilities from '@/components/Facilities/Facilities'
import Footer from '@/components/Footer/Footer'
import Hero from '@/components/HeroSchool/Hero'
import Subjects from '@/components/Subjects/Subject'
import React from 'react'

interface PageProps {
  params: Promise<{
    school: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { school } = await params;
  
  return (
     <div className="flex w-full justify-center overflow-x-hidden">
       <div className="min-h-screen max-w-[1266px] gap-16 w-full ">
    <Hero school={school}/>
    <About school={school}/>
    <Subjects school={school}/>
    <Banner school={school}/>
    <Facilities school={school}/>
    <Campus school={school}/>
    <Contact school={school}/>
    <Footer school={school}/>
    </div>
    </div>
   
  )
}

export default page
