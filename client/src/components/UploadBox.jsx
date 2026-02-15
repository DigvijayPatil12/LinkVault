import { useState, useRef } from 'react';
import axios from 'axios';
import { Clipboard, FileText, UploadCloud, Clock, X, File, Lock, EyeOff, Hash, Settings, Trash2 } from 'lucide-react';

export default function UploadBox() {
  const [mode, setMode] = useState('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState(10);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [deleteToken, setDeleteToken] = useState(null);

  // Bonus Features State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [password, setPassword] = useState('');
  const [oneTimeView, setOneTimeView] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState('');

  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('type', mode);
    formData.append('expiresInMinutes', expiry);
    
    // Bonus Fields
    if (password) formData.append('password', password);
    if (oneTimeView) formData.append('oneTimeView', 'true');
    if (maxDownloads) formData.append('maxDownloads', maxDownloads);

    if (mode === 'text') {
      formData.append('textContent', content);
    } else {
      formData.append('file', file);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGeneratedLink(res.data.link);
      setDeleteToken(res.data.deleteToken);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all">
      {/* Header Tabs */}
      <div className="flex gap-4 mb-6 relative z-10">
        <button
          onClick={() => { setMode('text'); setGeneratedLink(null); }}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${
            mode === 'text' ? 'bg-teal-500 text-white shadow-md shadow-teal-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <FileText size={20} /> Paste Text
        </button>
        <button
          onClick={() => { setMode('file'); setGeneratedLink(null); }}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${
            mode === 'file' ? 'bg-teal-500 text-white shadow-md shadow-teal-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <UploadCloud size={20} /> Upload File
        </button>
      </div>

      {!generatedLink ? (
        <div className="space-y-5">
          {mode === 'text' ? (
            <textarea
              className="w-full h-48 p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-violet-500 focus:ring-0 outline-none resize-none transition-colors"
              placeholder="Paste your secret text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <div className="relative h-48">
                {!file ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center bg-gray-50 hover:bg-violet-50 hover:border-violet-300 transition-all group">
                        <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                        <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform"><UploadCloud size={32} className="text-violet-500" /></div>
                        <p className="text-gray-500 font-medium group-hover:text-violet-600">Drag & Drop or Click to Upload</p>
                    </div>
                ) : (
                    <div className="border-2 border-violet-200 border-dashed bg-violet-50 rounded-xl h-full flex flex-col items-center justify-center relative animate-in fade-in zoom-in duration-300">
                        <button onClick={clearSelection} className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors z-30"><X size={18} /></button>
                        <File size={48} className="text-violet-500 mb-3" />
                        <p className="font-bold text-gray-700 text-center px-4 truncate w-full max-w-[80%]">{file.name}</p>
                    </div>
                )}
            </div>
          )}

          {/* Settings Bar */}
          <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
                <Clock size={18} className="text-violet-500" />
                <span className="font-medium">Auto-delete after:</span>
            </div>
            <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-white border border-gray-200 rounded-md px-3 py-1 outline-none focus:border-violet-500 text-gray-700">
              <option value={10}>10 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={1440}>1 Day</option>
            </select>
          </div>

          {/* ADVANCED TOGGLE */}
          <div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-violet-600 transition-colors mb-2">
                <Settings size={16} /> Advanced Options {showAdvanced ? '▲' : '▼'}
            </button>
            
            {showAdvanced && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <Lock size={18} className="text-gray-400" />
                        <input type="password" placeholder="Set Password (Optional)" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-violet-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Hash size={18} className="text-gray-400" />
                        <input type="number" placeholder="Max Downloads (Optional)" value={maxDownloads} onChange={(e) => setMaxDownloads(e.target.value)} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-violet-500" />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        <div className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center ${oneTimeView ? 'bg-violet-500 border-violet-500' : 'bg-white border-gray-300'}`} onClick={() => setOneTimeView(!oneTimeView)}>
                            {oneTimeView && <X size={14} className="text-white" />}
                        </div>
                        <label className="text-sm text-gray-600 cursor-pointer select-none" onClick={() => setOneTimeView(!oneTimeView)}>
                            Burn after reading (One-time View)
                        </label>
                    </div>
                </div>
            )}
          </div>

          <button onClick={handleUpload} disabled={loading || (mode === 'text' && !content) || (mode === 'file' && !file)} className="w-full bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-600 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Securing Content...' : 'Generate Secure Link'}
          </button>
        </div>
      ) : (
        /* Result View */
        <div className="text-center space-y-6 pt-4">
          <div className="bg-teal-50 text-teal-700 p-4 rounded-xl border border-teal-100 font-medium flex items-center justify-center gap-2">
            <span className="text-xl">🎉</span> Link Generated Successfully!
          </div>
          
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Share this link</label>
            <div className="flex items-center gap-2 bg-gray-50 p-2 pl-4 rounded-xl border border-gray-200">
                <input readOnly value={generatedLink} className="bg-transparent flex-1 outline-none text-gray-600 font-mono text-sm" />
                <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="p-2 bg-white hover:bg-violet-50 text-gray-500 hover:text-violet-600 rounded-lg border border-gray-200"><Clipboard size={18} /></button>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-left space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <Trash2 size={16} /> Admin Delete Token (SAVE THIS!)
            </div>
            <p className="text-xs text-red-500">Use this token to manually delete your file if needed.</p>
            <div className="flex items-center gap-2 bg-white p-2 pl-4 rounded-lg border border-red-200">
                <input readOnly value={deleteToken} className="bg-transparent flex-1 outline-none text-red-600 font-mono text-sm" />
                <button onClick={() => navigator.clipboard.writeText(deleteToken)} className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"><Clipboard size={16} /></button>
            </div>
          </div>

          <button onClick={() => { setGeneratedLink(null); setDeleteToken(null); }} className="text-violet-600 text-sm font-semibold hover:text-violet-800 hover:underline">
            Upload Another Item
          </button>
        </div>
      )}
    </div>
  );
}