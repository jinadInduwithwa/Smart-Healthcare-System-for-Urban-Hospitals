import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchCard = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

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
        // Automatically navigate to consultation page
        navigate(`/doctor-dashboard/consultation/add/${userId}`);
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
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Patient QR Code Scanner</h2>
      <p className="text-gray-600 mb-6 text-center">
        Scan patient QR code to access their consultation record
      </p>
      
      <div className="w-full max-w-md mb-6">
        {ScannerComponent ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative">
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
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <p className="text-gray-500">Loading scanner...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg w-full max-w-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <button 
            onClick={resetScanner}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {scanResult && isValid === false && (
        <div className="w-full max-w-md">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800">Invalid QR Code</h3>
            
            <div className="mt-2">
              <p className="text-sm text-gray-600">Scanned Content:</p>
              <p className="mt-1 break-all font-mono text-sm bg-white p-2 rounded border">
                {scanResult}
              </p>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={resetScanner}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Scan Another Code
              </button>
            </div>
          </div>
        </div>
      )}

      {isValid === true && parsedData && (
        <div className="w-full max-w-md">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800">Redirecting to Consultation...</h3>
            
            <div className="mt-2">
              <p className="text-sm text-gray-600">Patient ID:</p>
              <p className="mt-1 font-mono text-sm bg-white p-2 rounded border">
                {parsedData.userId}
              </p>
            </div>
            
            <div className="mt-3">
              <p>Navigating to consultation page for this patient...</p>
            </div>
          </div>
        </div>
      )}

      {!scanResult && !error && (
        <div className="text-gray-500 text-sm mt-4 text-center">
          <p>Ensure your camera is properly connected and permissions are granted</p>
        </div>
      )}
    </div>
  );
};

export default SearchCard;