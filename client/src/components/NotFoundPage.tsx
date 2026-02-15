import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6 animate-bounce">
                <Ghost size={48} />
            </div>

            <h1 className="text-4xl font-black text-black mb-2">404</h1>
            <h2 className="text-xl font-bold text-gray-800 mb-4">This Drop Evaporated</h2>

            <p className="text-gray-500 max-w-md mb-8">
                The file you are looking for might have expired, been deleted, or never existed in this dimension.
            </p>

            <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
            >
                <Home size={18} />
                <span>Go Home</span>
            </button>
        </div>
    );
}
