import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadBox from './components/UploadBox';
import ViewDrop from './pages/ViewDrop';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 py-10 font-sans">
         <div className="text-center mb-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-violet-600 mb-2">
               LinkVault
            </h1>
            <p className="text-gray-500 font-medium">Secure, Temporary File & Text Sharing</p>
         </div>
         
         <Routes>
            <Route path="/" element={<UploadBox />} />
            <Route path="/:id" element={<ViewDrop />} />
         </Routes>
      </div>
    </Router>
  );
}

export default App;