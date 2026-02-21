import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Copy, ArrowRight, File as FileIcon, Settings, Lock, Flame, Film, Clock, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

type RecentUpload = {
    code: string;
    filename: string;
    timestamp: number;
    size: number;
};

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [code, setCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Security options
    const [showOptions, setShowOptions] = useState(false);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [oneTime, setOneTime] = useState(false);
    const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('recentUploads');
        if (saved) {
            try {
                setRecentUploads(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const saveToHistory = (code: string, file: File) => {
        const newUpload: RecentUpload = {
            code,
            filename: file.name,
            timestamp: Date.now(),
            size: file.size
        };
        const updated = [newUpload, ...recentUploads].slice(0, 5); // Keep last 5
        setRecentUploads(updated);
        localStorage.setItem('recentUploads', JSON.stringify(updated));
    };

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
            const data = await api.uploadFile(file, { password, oneTime, email }, setProgress);
            setCode(data.code);
            saveToHistory(data.code, file);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            toast.success("File uploaded successfully!");
        } catch (err) {
            setError(api.getErrorMsg(err));
            setIsUploading(false);
            setProgress(0);
            toast.error("Upload failed");
        }
    };

    const copyLink = () => {
        if (code) {
            navigator.clipboard.writeText(`${window.location.origin}/d/${code}`);
            toast.success("Link copied to clipboard");
        }
    };

    if (code) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
            >
                <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mx-auto shadow-xl shadow-black/10">
                    <CheckCircle size={40} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-black dark:text-white">File Ready to Share!</h2>
                    <p className="text-gray-500 dark:text-gray-400">Share this code or link with anyone.</p>
                </div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 max-w-md mx-auto relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
                >
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-black/5 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-in-out -translate-x-[200%] group-hover:translate-x-[300%]" />
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Share Code</div>
                        <div className="text-5xl font-mono font-bold text-black dark:text-white tracking-widest mb-6 select-all">{code}</div>

                        <div className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Share Link</div>
                        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 border border-gray-200 dark:border-zinc-700">
                            <span className="text-gray-600 dark:text-gray-300 truncate flex-1 text-sm font-mono">{window.location.origin}/d/{code}</span>
                            <button onClick={copyLink} className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-md transition-all text-gray-600 dark:text-gray-400">
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
                </motion.div>

                <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                    Send another file
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
        >
            <div className="text-center mb-10">
                <h1 className="text-5xl font-extrabold mb-4 text-black dark:text-white tracking-tight">Flash Drop</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">Ultra-simple file sharing for everyone.</p>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-zinc-800/50 relative transition-colors duration-300 overflow-hidden">
                {/* Stunning Glassmorphism Background Preview */}
                {file && file.type.startsWith('image/') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-0 pointer-events-none"
                    >
                        <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover opacity-30 dark:opacity-40 blur-2xl scale-125"
                            alt="bg-preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 via-white/50 dark:via-zinc-900/50 to-transparent" />
                    </motion.div>
                )}
                <div className="relative z-10">
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden",
                                isDragActive
                                    ? "border-black dark:border-white bg-gray-50 dark:bg-zinc-800 scale-[1.02]"
                                    : "border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                            )}
                        >
                            <input {...getInputProps()} />
                            {isDragActive && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 z-0 bg-gradient-to-tr from-black/5 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none"
                                />
                            )}
                            <div className="flex justify-center mb-6 relative z-10">
                                <motion.div
                                    animate={isDragActive ? { y: [0, -10, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-black dark:text-white group-hover:scale-110 transition-transform duration-300 relative"
                                >
                                    {isDragActive && (
                                        <motion.div
                                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 rounded-full bg-black dark:bg-white"
                                        />
                                    )}
                                    <UploadCloud size={48} className="relative z-10" />
                                </motion.div>
                            </div>
                            <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                {isDragActive ? 'Drop it like it\'s hot!' : 'Drag & drop a file here'}
                            </p>
                            <p className="text-gray-400">or click to browse</p>
                            <p className="text-xs text-gray-300 dark:text-zinc-600 mt-6">Max 100MB • Auto-deletes in 1 hour</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center space-x-4 bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
                                <div className="bg-white dark:bg-zinc-700 p-3 rounded-lg shadow-sm text-black dark:text-white relative overflow-hidden">
                                    {file.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-6 h-6 object-cover" />
                                    ) : file.type.startsWith('video/') ? (
                                        <Film size={24} />
                                    ) : (
                                        <FileIcon size={24} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                {!isUploading && (
                                    <button onClick={() => setFile(null)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {!isUploading && (
                                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
                                    <button
                                        onClick={() => setShowOptions(!showOptions)}
                                        className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-full hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        <Settings size={16} />
                                        <span>Security Options</span>
                                        <span className="ml-auto text-xs text-gray-400">{showOptions ? 'Hide' : 'Show'}</span>
                                    </button>

                                    {showOptions && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="mt-4 space-y-3 overflow-hidden"
                                        >
                                            <div>
                                                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-1 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={oneTime}
                                                        onChange={(e) => setOneTime(e.target.checked)}
                                                        className="rounded border-gray-300 dark:border-zinc-600 text-black focus:ring-black bg-white dark:bg-zinc-700"
                                                    />
                                                    <Flame size={14} className={oneTime ? "text-orange-500" : "text-gray-400"} />
                                                    <span>Burn after reading (Delete after 1 download)</span>
                                                </label>
                                            </div>
                                            <div>
                                                <div className="relative">
                                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="Optional password protection"
                                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Notify me via email (optional)"
                                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {isUploading ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <span>Uploading...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-black dark:bg-white"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ type: "spring", stiffness: 50 }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleUpload}
                                    className="w-full py-4 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-bold text-lg shadow-lg active:scale-95 flex items-center justify-center space-x-2 transition-all"
                                >
                                    <span>Generate Link</span>
                                    <ArrowRight size={20} />
                                </button>
                            )}

                            {error && <p className="text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Recent Uploads */}
            {recentUploads.length > 0 && (
                <div className="mt-12 animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <Clock size={18} className="mr-2" /> Recent Uploads
                    </h3>
                    <div className="space-y-3">
                        {recentUploads.map((upload) => (
                            <div key={upload.code} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className="bg-gray-100 dark:bg-zinc-800 p-2 rounded-lg">
                                        <FileIcon size={16} className="text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate">{upload.filename}</p>
                                        <p className="text-xs text-gray-500">{(upload.size / 1024 / 1024).toFixed(2)} MB • {new Date(upload.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <a href={`/d/${upload.code}`} target="_blank" rel="noreferrer" className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                                    View
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
