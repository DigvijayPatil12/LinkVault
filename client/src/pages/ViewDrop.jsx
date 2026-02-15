import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, AlertTriangle, FileText, Clock, Lock, Trash2, ShieldAlert } from 'lucide-react';

export default function ViewDrop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Delete State
  const [showDelete, setShowDelete] = useState(false);
  const [deleteToken, setDeleteToken] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchData = (pwd = '') => {
    axios.get(`http://localhost:5000/api/${id}`, { params: { password: pwd } })
      .then(res => {
        setData(res.data);
        setIsProtected(false);
        setError('');
      })
      .catch(err => {
        if (err.response?.status === 401) setIsProtected(true);
        else if (err.response?.status === 403) setError('Link expired or deleted.');
        else if (err.response?.status === 410) setError('Limit reached. This link is dead.');
        else setError('Link not found.');
      });
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    if (!deleteToken) return;
    try {
        await axios.post('http://localhost:5000/api/delete', { shortId: id, deleteToken });
        setDeleteMsg('Deleted Successfully!');
        setTimeout(() => navigate('/'), 2000);
    } catch (err) {
        alert('Invalid Token');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-10 bg-white shadow-xl rounded-2xl max-w-md w-full border border-red-50">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Password Lock Screen
  if (isProtected) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4">
                <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto">
                    <Lock size={32} className="text-violet-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Password Required</h2>
                <p className="text-sm text-gray-500">This drop is password protected.</p>
                <input 
                    type="password" 
                    placeholder="Enter Password" 
                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-violet-500 text-center"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button onClick={() => fetchData(passwordInput)} className="w-full bg-violet-600 text-white py-3 rounded-lg font-bold hover:bg-violet-700">
                    Unlock Content
                </button>
            </div>
        </div>
    );
  }

  if (!data) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        
        {/* Burn after reading warning */}
        {data.oneTimeView && (
            <div className="bg-orange-500 text-white text-xs font-bold text-center py-1 flex justify-center items-center gap-2">
                <ShieldAlert size={14} /> WARNING: This is a one-time view. Refreshing will delete it.
            </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-violet-600 p-8 text-white flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold">Secure Drop</h1>
                <p className="opacity-90 text-sm mt-1 flex items-center gap-2">
                    <Clock size={14} /> Expires: {new Date(data.expiresAt).toLocaleString()}
                </p>
            </div>
            {/* Delete Button */}
            <button onClick={() => setShowDelete(!showDelete)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30" title="Manual Delete">
                <Trash2 size={20} />
            </button>
        </div>

        {/* Manual Delete Panel */}
        {showDelete && (
            <div className="bg-red-50 p-4 border-b border-red-100 animate-in slide-in-from-top">
                <p className="text-xs font-bold text-red-600 mb-2 uppercase">Manual Deletion</p>
                <div className="flex gap-2">
                    <input 
                        placeholder="Paste Delete Token" 
                        value={deleteToken}
                        onChange={(e) => setDeleteToken(e.target.value)}
                        className="flex-1 text-sm p-2 border border-red-200 rounded outline-none"
                    />
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700">
                        Delete
                    </button>
                </div>
                {deleteMsg && <p className="text-green-600 text-sm mt-2 font-bold">{deleteMsg}</p>}
            </div>
        )}

        {/* Content Body */}
        <div className="p-8">
          {data.type === 'text' ? (
            <div className="relative group">
              <pre className="w-full p-6 bg-gray-50 border border-gray-200 rounded-xl overflow-auto whitespace-pre-wrap font-mono text-sm max-h-96 text-gray-700 leading-relaxed">
                {data.textContent}
              </pre>
              <button onClick={() => navigator.clipboard.writeText(data.textContent)} className="absolute top-4 right-4 bg-white p-2 border border-gray-200 rounded-lg shadow-sm text-xs hover:bg-violet-50 hover:text-violet-600 transition-all opacity-0 group-hover:opacity-100">Copy</button>
            </div>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div className="mx-auto w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-0">
                <FileText className="text-violet-600" size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{data.originalName}</h3>
                <p className="text-sm text-gray-400 font-mono uppercase tracking-wide">{data.mimeType?.split('/')[1] || 'FILE'}</p>
              </div>
              <a href={data.fileUrl} download className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-gray-200">
                <Download size={20} /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}