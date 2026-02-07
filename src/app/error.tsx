"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react"; // lucide-reactのアイコン

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("error.tsxで受け取ったエラー", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full">
            <AlertCircle className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Something went wrong!
        </h2>
        <p className="text-gray-600">
          An error occurred while processing your order. Please try again.
        </p>
        <p className="text-sm text-gray-400">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}