import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Copy, ArrowRight, File as FileIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '../api';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [code, setCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        maxSize: 100 * 1024 * 1024 // 100MB
    });

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);
        try {
            const data = await api.uploadFile(file, setProgress);
            setCode(data.code);
        } catch (err) {
            setError(api.getErrorMsg(err));
            setIsUploading(false);
            setProgress(0);
        }
    };

    const copyLink = () => {
        if (code) {
            navigator.clipboard.writeText(`${window.location.origin}/d/${code}`);
        }
    };

    if (code) {
        return (
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={40} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-black">File Ready to Share!</h2>
                    <p className="text-gray-500">Share this code or link with anyone.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto relative overflow-hidden">
                    <div className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Share Code</div>
                    <div className="text-5xl font-mono font-bold text-black tracking-widest mb-6">{code}</div>

                    <div className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Share Link</div>
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="text-gray-600 truncate flex-1 text-sm font-mono">{window.location.origin}/d/{code}</span>
                        <button onClick={copyLink} className="p-2 hover:bg-black hover:text-white rounded-md transition-all text-gray-600">
                            <Copy size={18} />
                        </button>
                    </div>

                    <div className="mt-6 flex flex-col items-center">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                            <QRCodeCanvas
                                value={`${window.location.origin}/d/${code}`}
                                size={120}
                                level={"H"}
                                fgColor={"#000000"}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Scan to download on mobile</p>
                    </div>
                </div>

                <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-black transition-colors">
                    Send another file
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-extrabold mb-4 text-black">Flash Drop</h1>
                <p className="text-xl text-gray-600">Ultra-simple file sharing for everyone.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 relative">
                {!file ? (
                    <div
                        {...getRootProps()}
                        className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
               ${isDragActive ? 'border-black bg-gray-50 scale-102' : 'border-gray-200 hover:border-black hover:bg-gray-50'}
             `}
                    >
                        <input {...getInputProps()} />
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-black">
                                <UploadCloud size={40} />
                            </div>
                        </div>
                        <p className="text-xl font-medium text-gray-900 mb-2">
                            {isDragActive ? 'Drop it like it\'s hot!' : 'Drag & drop a file here'}
                        </p>
                        <p className="text-gray-400">or click to browse</p>
                        <p className="text-xs text-gray-300 mt-6">Max 100MB • Auto-deletes in 1 hour</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="bg-white p-3 rounded-lg shadow-sm text-black">
                                <FileIcon size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            {!isUploading && (
                                <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-500 text-sm font-medium">Remove</button>
                            )}
                        </div>

                        {isUploading ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium text-gray-600">
                                    <span>Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleUpload}
                                className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 flex items-center justify-center space-x-2 transition-all"
                            >
                                <span>Generate Link</span>
                                <ArrowRight size={20} />
                            </button>
                        )}

                        {error && <p className="text-center text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
