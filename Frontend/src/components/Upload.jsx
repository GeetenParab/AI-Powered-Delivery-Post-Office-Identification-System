import { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [extractedAddress, setExtractedAddress] = useState(null);
  const [correctedAddress, setCorrectedAddress] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadSuccess(true);
      console.log('Upload successful:', response.data);
      
      // Save extracted address and ID from response
      if (response.data && response.data.address) {
        setExtractedAddress(response.data.address.extractedText);
        setAddressId(response.data.address._id);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle pincode validation
  const handleValidatePincode = async () => {
    if (!addressId) return;

    setIsValidating(true);
    setValidationError('');

    try {
      const response = await axios.post(`http://localhost:5000/api/validate-pin/${addressId}`);
      console.log('Validation successful:', response.data);
      
      // Set corrected address from response
      if (response.data) {
        setCorrectedAddress(response.data);
      }
      
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationError('Failed to validate pincode. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Reset the form to initial state
  const handleReset = () => {
    setFile(null);
    setUploadSuccess(false);
    setExtractedAddress(null);
    setCorrectedAddress(null);
    setAddressId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 to-cyan-100">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Address Validation System</h1>
          <p className="text-gray-600">
            Upload an image containing an address for extraction and validation
          </p>
        </div>

        {/* Show upload UI if no address is extracted yet */}
        {!extractedAddress && !correctedAddress && (
          <div className="max-w-xl mx-auto">
            {/* Enhanced Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center 
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mb-2">
                <div className="w-24 h-8 mx-auto flex items-center justify-center">
                  <svg 
                    className="w-16 h-16 text-slate-700" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M7 10.5L12 16.5L17 10.5" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M12 16.5V4.5" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M20 16.5V19.5C20 20.0523 19.5523 20.5 19 20.5H5C4.44772 20.5 4 20.0523 4 19.5V16.5" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              
              <p className="text-slate-700 text-lg font-medium mb-2">Drop Image here</p>
              
              {file ? (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected file:</p>
                  <p className="font-medium">{file.name}</p>
                  <button 
                    onClick={() => setFile(null)}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 w-full pt-4 mt-4">
                  <label className="cursor-pointer bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded transition-colors inline-block">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleChange}
                      name="photo"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {file && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`py-2 px-6 rounded bg-blue-500 text-white font-medium 
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Show address cards */}
        {extractedAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Extracted Address Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-sky-600 p-4">
                <h2 className="text-xl font-bold text-white">Extracted Address</h2>
                <p className="text-blue-100 text-sm">
                  Original address extracted from image
                </p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Street Address
                  </label>
                  <textarea 
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-50" 
                    value={extractedAddress.street} 
                    disabled
                    rows={2}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    City
                  </label>
                  <input 
                    type="text"
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-50" 
                    value={extractedAddress.city} 
                    disabled
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    State
                  </label>
                  <input 
                    type="text"
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-50" 
                    value={extractedAddress.state} 
                    disabled
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    PIN Code
                  </label>
                  <input 
                    type="text"
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-50" 
                    value={extractedAddress.pinCode} 
                    disabled
                  />
                </div>

                {!correctedAddress && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleValidatePincode}
                      disabled={isValidating}
                      className={`py-2 px-6 rounded bg-sky-700 text-white font-medium 
                      ${isValidating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-950'}`}
                    >
                      {isValidating ? 'Validating...' : 'Validate Pincode'}
                    </button>
                  </div>
                )}

                {validationError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {validationError}
                  </div>
                )}
              </div>
            </div>
            
            {/* Corrected Address Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-teal-600 p-4">
                <h2 className="text-xl font-bold text-white">Corrected Address</h2>
                <p className="text-green-100 text-sm">
                  Address with validated pincode
                </p>
              </div>

              <div className="p-6">
                {correctedAddress ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Street Address
                      </label>
                      <textarea 
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-50" 
                        value={correctedAddress.street || extractedAddress.street} 
                        disabled
                        rows={2}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        City
                      </label>
                      <input 
                        type="text"
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-50" 
                        value={correctedAddress.city || extractedAddress.city} 
                        disabled
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        State
                      </label>
                      <input 
                        type="text"
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-50" 
                        value={correctedAddress.state || extractedAddress.state} 
                        disabled
                      />
                    </div>
                    
                    <div className="mb-4 relative">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Validated PIN Code
                      </label>
                      <div className="flex items-center">
                        <input 
                          type="text"
                          className="appearance-none border border-green-300 rounded w-full py-2 px-3 bg-green-50 text-green-700 font-medium leading-tight" 
                          value={correctedAddress.pinCode} 
                          disabled
                        />
                        <div className="absolute right-3 text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400">Corrected address will appear here after validation</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Another Button */}
        {extractedAddress && (
          <div className="mt-10 text-center">
            <button
              onClick={handleReset}
              className="py-2 px-6 rounded bg-slate-800 hover:bg-black text-white font-medium"
            >
              Upload Another Image
            </button>
          </div>
        )}

      {/* Route Button - Add this below the Upload Another Image button */}
{extractedAddress && (
  <div className="mt-4 text-center">
    <button
      onClick={() => {
        if (addressId) {
          const routeUrl = `/route?addressId=${addressId}`;
          window.open(routeUrl, '_blank');
        }
      }}
      className="py-2 px-6 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center mx-auto gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      Show Mail Route Map
    </button>
  </div>
)}
          </div>
    </div>
  );
};

export default Upload;