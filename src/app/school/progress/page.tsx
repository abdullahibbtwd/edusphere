'use client';
import { useState } from 'react';
import { ImSpinner } from "react-icons/im";
import { FaDownload } from "react-icons/fa";

export default function ProgressPage() {
  const [isDownloading, setIsDownloading] = useState(false);


  const studentData = {
    applicationNumber: "APP123456",
    pdfUrl: "https://example.com/dummy-application.pdf"
  };

  const handleDownload = () => {
    if (!studentData?.pdfUrl) return;
    
    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = studentData.pdfUrl;
      link.download = `Application-Form-${studentData?.applicationNumber || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Application In Progress
            </h1>
            <p className="text-gray-600 mb-8">
              Your application is being reviewed by our admissions team.
            </p>
            
            <div className="flex justify-center mb-8">
              <ImSpinner 
                className="text-6xl text-indigo-600 animate-spin" 
              />
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 font-medium">
                Application Number:
              </p>
              <p className="text-xl font-mono font-bold text-indigo-700">
                {studentData?.applicationNumber || "Loading..."}
              </p>
            </div>
            
            <p className="text-gray-600 mb-6 text-sm">
              You can download a copy of your submitted application form for your records.
            </p>
            
            <button
              onClick={handleDownload}
              disabled={!studentData?.pdfUrl || isDownloading}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-3 transition-all ${
                studentData?.pdfUrl 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg" 
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              } ${
                isDownloading ? "opacity-75" : ""
              }`}
            >
              {isDownloading ? (
                <>
                  <ImSpinner className="animate-spin" />
                  Preparing Download...
                </>
              ) : (
                <>
                  <FaDownload />
                  {studentData?.pdfUrl ? "Download Application Form" : "Loading Document..."}
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 text-center">
          <p className="text-sm text-indigo-700">
            Contact admissions@gmail.com if you have questions
          </p>
        </div>
      </div>
    </div>
  );
}
