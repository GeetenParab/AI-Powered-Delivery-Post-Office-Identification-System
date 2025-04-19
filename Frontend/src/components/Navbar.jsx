import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-2">
          <span className="text-black font-bold">LOGO</span>
        </div>
      </div>
      
      <div className="flex space-x-6">
        <Link to="/" className="hover:text-orange-400">Upload</Link>
        <Link to="/sort" className="hover:text-orange-400">Sort</Link>
      </div>
      
      {/* Empty div to maintain flex layout */}
      <div className="w-12"></div>
    </nav>
  );
};

export default Navbar;