import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiArrowLeft, FiUser, FiList, FiGrid } from 'react-icons/fi';

const SearchCard = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(true);

  // Dynamically import the QR scanner to avoid SSR issues
  const [ScannerComponent, setScannerComponent] = useState<any>(null);
  
  useEffect(() => {
    const loadScanner = async () => {
      try {
        const module = await import('@yudiel/react-qr-scanner');
        setScannerComponent(() => module.Scanner);
      } catch (err) {
        console.error('Failed to load QR scanner:', err);
        setError('QR scanner failed to load. Please check console for details.');
      }
    };
    
    loadScanner();
  }, []);

  const extractUserId = (content: string): string | null => {
    // Try to parse as JSON first
    try {
      const jsonData = JSON.parse(content);
      if (jsonData.userId) {
        return jsonData.userId;
      }
    } catch (e) {
      // Not valid JSON, try regex approach
    }
    
    // Try to extract userId using regex for formats like:
    // { userId:68d895b03c66b57875a7b035 }
    // userId:68d895b03c66b57875a7b035
    const regex = /["']?userId["']?\s*[:=]\s*["']?([a-zA-Z0-9]+)["']?/;
    const match = content.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  };

  const handleScanResult = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      setScanResult(result);
      setError(null);
      
      // Extract userId from the scanned content
      const userId = extractUserId(result);
      
      if (userId) {
        setParsedData({ userId });
        setIsValid(true);
        // Automatically navigate to consultation page after a short delay
        setTimeout(() => {
          navigate(`/doctor-dashboard/consultation/add/${userId}`);
        }, 1500);
      } else {
        setIsValid(false);
        setError('Invalid QR code format. Could not extract userId.');
      }
    }
  };

  const handleError = (err: Error) => {
    console.error('QR Scan Error:', err);
    // Provide more user-friendly error messages
    if (err.name === 'NotAllowedError') {
      setError('Camera access denied. Please allow camera access to scan QR codes.');
    } else if (err.name === 'NotFoundError') {
      setError('No camera found. Please connect a camera to scan QR codes.');
    } else if (err.name === 'NotReadableError') {
      setError('Camera is already in use. Please close other applications using the camera.');
    } else {
      setError(`Failed to scan QR code: ${err.message || 'Unknown error'}`);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setParsedData(null);
    setError(null);
    setIsValid(null);
    setIsScannerActive(true);
  };

  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive);
  };

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Patient Search</h1>
          <div></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-white dark:bg-gray-800  overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <FiGrid className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
              Patient QR Code Scanner
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Scan patient QR code to access their consultation record
            </p>

            <div className="w-full mb-6">
              {ScannerComponent ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden relative bg-gray-50 dark:bg-gray-700/30">
                  {isScannerActive ? (
                    <ScannerComponent
                      onScan={handleScanResult}
                      onError={handleError}
                      styles={{ 
                        container: { width: '100%', height: '300px' },
                        video: { width: '100%', height: '100%', objectFit: 'cover' as const }
                      }}
                      constraints={{ facingMode: 'environment' }} // Prefer back camera
                      components={{
                        tracker: true,
                        torch: true
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      <FiCamera className="text-gray-400 dark:text-gray-500 text-4xl mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">Scanner paused</p>
                      <button
                        onClick={toggleScanner}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Resume Scanner
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading scanner...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={toggleScanner}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                <FiCamera className="mr-2" />
                {isScannerActive ? 'Pause Scanner' : 'Resume Scanner'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-start">
                  <FiAlertCircle className="text-xl mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error scanning QR code</p>
                    <p className="mt-1 text-sm">{error}</p>
                    <button 
                      onClick={resetScanner}
                      className="mt-3 flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-800/50 text-red-800 dark:text-red-200 rounded-lg text-sm transition-colors"
                    >
                      <FiRefreshCw className="mr-1" /> Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scanResult && isValid === false && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="font-semibold flex items-center">
                  <FiAlertCircle className="mr-2" /> Invalid QR Code
                </h3>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Scanned Content:</p>
                  <p className="mt-1 break-all font-mono text-sm bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    {scanResult}
                  </p>
                </div>
                
                <div className="mt-4">
                  <button 
                    onClick={resetScanner}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FiRefreshCw className="mr-2" /> Scan Another Code
                  </button>
                </div>
              </div>
            )}

            {isValid === true && parsedData && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-semibold flex items-center">
                  <FiCheckCircle className="mr-2" /> Redirecting to Consultation...
                </h3>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Patient ID:</p>
                  <p className="mt-1 font-mono text-sm bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    {parsedData.userId}
                  </p>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <p>Navigating to consultation page for this patient...</p>
                  </div>
                </div>
              </div>
            )}

            {!scanResult && !error && (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Position the QR code within the frame to scan
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Ensure your camera is properly connected and permissions are granted
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800  p-6">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Alternative Search Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/doctor-dashboard/patient-records/all')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-2">
                <FiUser className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">Patient Records</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                Browse all patient records manually
              </p>
            </button>
            <button
              onClick={() => navigate('/doctor-dashboard/overview')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-2">
                <FiList className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">Dashboard</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                Return to doctor dashboard
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCard;