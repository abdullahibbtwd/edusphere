
import About from '@/components/About/About'
import Banner from '@/components/Banner/Banner'
import Campus from '@/components/Campus/Campus'
import Contact from '@/components/Contact/Contact'
import Facilities from '@/components/Facilities/Facilities'
import Footer from '@/components/Footer/Footer'
import Hero from '@/components/HeroSchool/Hero'
import Navbar from '@/components/Navbar/Navbar'
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
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Fixed Navbar at page level */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar subdomain={school} />
      </div>

      {/* Page content with padding to account for fixed navbar */}
      <div className="pt-8 md:pt-16">
        <Hero school={school} />
        <About school={school} />
        <Subjects school={school} />
        <Banner school={school} />
        <Facilities school={school} />
        <Campus school={school} />
        <Contact school={school} />
        <Footer school={school} />
      </div>
    </div>

  )
}

export default page
