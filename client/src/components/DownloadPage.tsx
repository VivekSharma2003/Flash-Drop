import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, File, Clock, Lock } from 'lucide-react';
import { api } from '../api';

export default function DownloadPage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!code);
    const [fileInfo, setFileInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState(code || '');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (code) {
            fetchInfo(code);
        }
    }, [code]);

    const fetchInfo = async (c: string) => {
        setLoading(true);
        setError(null);
        try {
            const info = await api.getFileInfo(c);
            setFileInfo(info);
        } catch (err) {
            setError("This file doesn't exist or has expired.");
            setFileInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!fileInfo) return;
        const pwdParam = password ? `?pwd=${encodeURIComponent(password)}` : '';
        window.location.href = `http://localhost:3000/api/file/${fileInfo.code}${pwdParam}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCode.length === 6) {
            navigate(`/d/${inputCode}`);
            fetchInfo(inputCode);
        }
    };

    if (!code) {
        return (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">Receive a File</h2>
                <div className="relative">
                    <input
                        type="text"
                        maxLength={6}
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="ENTER 6-DIGIT CODE"
                        className="w-full text-center text-3xl font-mono tracking-[0.5em] p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none uppercase placeholder:tracking-normal placeholder:text-lg placeholder:font-sans"
                    />
                </div>
                <button
                    type="submit"
                    disabled={inputCode.length !== 6}
                    className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Get File
                </button>
            </form>
        )
    }

    return (
        <div className="max-w-md mx-auto">
            {loading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-20">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-500">Looking for your file...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 bg-white rounded-3xl shadow-xl p-8 border border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Oops!</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="text-primary font-semibold hover:underline">Go Home</button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-black mb-4">
                            <File size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 break-all px-4">{fileInfo.filename}</h2>
                        <p className="text-gray-500 mt-1">{(fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mb-6">
                            <Clock size={16} />
                            <span>Files auto-delete 1 hour after upload</span>
                        </div>

                        {fileInfo.isProtected && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Lock size={14} className="text-black" />
                                    Password Required
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter file password"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleDownload}
                            disabled={fileInfo.isProtected && !password}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center space-x-2
                                ${fileInfo.isProtected && !password
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-black hover:bg-gray-800 text-white active:scale-95'
                                }`}
                        >
                            <Download size={20} />
                            <span>{fileInfo.isProtected && !password ? 'Enter Password' : 'Download Now'}</span>
                        </button>
                        <div className="text-center mt-6">
                            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-black text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
