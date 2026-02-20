// app/rejection/page.tsx
'use client';
import { FaSadTear } from "react-icons/fa";

export default function RejectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              We Regret to Inform You
            </h1>
            <p className="text-gray-600 mb-8">
              Unfortunately, your application for admission has not been accepted this year.
            </p>

            <div className="flex justify-center mb-8">
              <FaSadTear className="text-6xl text-rose-600" />
            </div>

            <p className="text-gray-700 font-medium mb-6">
              We appreciate the time and effort you put into your application.
            </p>

            <p className="text-gray-600 mb-6 text-sm">
              Please consider reapplying next year. We look forward to the possibility of welcoming you in the future.
            </p>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 px-4 rounded-lg font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Return to Home Page
            </button>
          </div>
        </div>

        <div className="bg-rose-50 p-4 text-center">
          <p className="text-sm text-rose-700">
            If you have any questions, feel free to contact admissions@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
