import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, File, Clock, Lock, Image as ImageIcon, Film, Music, FileText, Code, Archive } from 'lucide-react';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownTimer } from './CountdownTimer';

export default function DownloadPage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!code);
    const [fileInfo, setFileInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState(code || '');
    const [password, setPassword] = useState('');
    const [isBurning, setIsBurning] = useState(false);

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
        const triggerDownload = () => {
            const pwdParam = password ? `?pwd=${encodeURIComponent(password)}` : '';
            window.location.href = `http://localhost:3000/api/file/${fileInfo.code}${pwdParam}`;
        };

        if (fileInfo.isOneTime) {
            setIsBurning(true);
            setTimeout(() => {
                triggerDownload();
                setFileInfo(null);
                setError("This file has been burned and is no longer available.");
            }, 1000);
        } else {
            triggerDownload();
        }
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

    const getFileIcon = (mimeType: string) => {
        if (!mimeType) return <File size={40} className="text-gray-500" />;
        if (mimeType.startsWith('image/')) return <ImageIcon size={40} className="text-blue-500" />;
        if (mimeType.startsWith('video/')) return <Film size={40} className="text-purple-500" />;
        if (mimeType.startsWith('audio/')) return <Music size={40} className="text-pink-500" />;
        if (mimeType.startsWith('text/html') || mimeType.includes('json') || mimeType.includes('javascript')) return <Code size={40} className="text-yellow-500" />;
        if (mimeType.startsWith('text/')) return <FileText size={40} className="text-gray-600" />;
        if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return <Archive size={40} className="text-orange-500" />;
        return <File size={40} className="text-indigo-500" />;
    };

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
                <AnimatePresence>
                    {!isBurning && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, filter: 'blur(10px) brightness(200%) sepia(100%) hue-rotate(-50deg) saturate(500%)' }}
                            transition={{ duration: 0.8 }}
                            className={`bg-white rounded-3xl shadow-2xl overflow-hidden border ${fileInfo.isOneTime ? 'border-orange-500/50 shadow-orange-500/20 shadow-2xl' : 'border-gray-100'}`}
                        >
                            {fileInfo.isOneTime && (
                                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold uppercase tracking-widest text-center py-1.5 flex justify-center items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    Burn After Reading
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                </div>
                            )}
                            <div className="bg-gray-50 p-8 text-center border-b border-gray-100 relative overflow-hidden">
                                {fileInfo.isOneTime && (
                                    <div className="absolute inset-0 bg-orange-500/5 pointer-events-none" />
                                )}
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 relative z-10">
                                    {getFileIcon(fileInfo.type)}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 break-all px-4 relative z-10">{fileInfo.filename}</h2>
                                <p className="text-gray-500 mt-1 relative z-10">{(fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <div className="p-8">
                                <div className="flex flex-col items-center justify-center space-y-3 bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                                        <Clock size={16} />
                                        <span>File auto-deletes in:</span>
                                    </div>
                                    <CountdownTimer uploadTime={fileInfo.uploadTime} className="text-lg px-4 py-1" />
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
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
