import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Upload from './components/Upload.jsx';
import Rout from './components/Rout.jsx';

import AddressSortingPage from './components/AddressSortingPage.jsx';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/route" element={<Rout />} />
            <Route path="/sort" element={<AddressSortingPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;