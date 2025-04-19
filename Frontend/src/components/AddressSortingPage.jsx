import { useState, useEffect } from 'react';
import { Info, Map } from 'lucide-react';

export default function AddressSortingPage() {
  const [addresses, setAddresses] = useState({
    unverified: [],
    verified: [],
    markForReview: [],
    samePO: [],
    local: [],
    intraState: [],
    interState: []
  });

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [displayedAddresses, setDisplayedAddresses] = useState([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/validate-pin/sort');
        const data = await response.json();
        setAddresses(data);
        setActiveFilter('local');
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    if (activeFilter && addresses[activeFilter]) {
      setDisplayedAddresses(addresses[activeFilter]);
    } else {
      setDisplayedAddresses([]);
    }
  }, [activeFilter, addresses]);

  const setFilter = (filter) => {
    if (filter === 'unverified') return;
    setActiveFilter(filter);
  };

  const getLabelColor = (label) => {
    if (label === 'Local') return 'bg-blue-700';
    if (label === 'Outstation (Inter-state)') return 'bg-purple-700';
    if (label === 'Outstation (Intra-state)') return 'bg-indigo-700';
    if (label === 'Same PO') return 'bg-green-700';
    return 'bg-gray-700';
  };

  const showRouteMap = (addressId) => {
    if (addressId) {
      const routeUrl = `/route?addressId=${addressId}`;
      window.open(routeUrl, '_blank');
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Address Sorting</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {['verified', 'markForReview', 'samePO', 'local', 'intraState', 'interState'].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilter(filter)}
            className={`px-5 py-2 rounded-full font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1).replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : displayedAddresses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No addresses found for the selected filter
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {displayedAddresses.map((address) => (
            <div
              key={address._id}
              className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-xl min-h-[320px]"
            >
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-white">Corrected Address</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium text-white ${getLabelColor(address.label)}`}>
                      {address.label}
                    </span>
                    <button className="p-1 rounded-full hover:bg-gray-700">
                      <Info size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-xl p-4 text-gray-200 text-sm">
                  <p className="whitespace-pre-line leading-relaxed">
                    {address.correctedAddress.street}<br />
                    {address.correctedAddress.city}, {address.correctedAddress.state}<br />
                    {address.correctedAddress.pinCode}
                  </p>
                </div>

                <div className="mt-3 text-indigo-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Destination PO: {address.destinationPostOffice || 'N/A'}
                </div>
              </div>

              <button
                onClick={() => showRouteMap(address._id)}
                className="w-full py-3 px-4 bg-indigo-700 hover:bg-indigo-600 text-white font-medium flex items-center justify-center gap-2 transition-colors rounded-b-2xl"
              >
                <Map size={20} />
                Show Mail Route Map
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
