"use client"
import About from '@/components/About'
import Contact from '@/components/Contact'
import Features from '@/components/Features'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Navbar from '@/components/NavBar'
import Pricing from '@/components/Pricing'
import React from 'react'

const page = () => {
  return (
  <div>
    <Navbar/>
    <Hero/>
    <About/>
    <Features/>
    <Pricing/>
    <Contact/>
    <Footer/>
  </div>
  )
}

export default page
