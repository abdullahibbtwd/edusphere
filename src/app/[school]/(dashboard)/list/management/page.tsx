import SchoolManagement from '@/components/Schools/SchoolManagement'
import React from 'react'

interface PageProps {
  params: Promise<{
    school: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { school } = await params;
  
  return (
    <div>
      <SchoolManagement school={school} />
    </div>
  )
}

export default page
