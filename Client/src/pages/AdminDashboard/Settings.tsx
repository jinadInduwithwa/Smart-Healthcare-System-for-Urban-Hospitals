import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getProfile, updateProfile } from "@/utils/api";

interface UserSettings {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  twoFactorEnabled: boolean;
}

interface QRCodeData {
  id: string;
  type: 'PROFILE' | 'APPOINTMENT' | 'MEDICAL_RECORD';
  data: string;
  qrCode?: string;
  createdAt: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    theme: 'light',
    language: 'en',
    twoFactorEnabled: false
  });

  const [qrData, setQrData] = useState<string>('');
  const [qrType, setQrType] = useState<'PROFILE' | 'APPOINTMENT' | 'MEDICAL_RECORD'>('PROFILE');
  const [generatedQRCodes, setGeneratedQRCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadUserProfile();
    loadGeneratedQRCodes();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getProfile();
      
      const savedSettings = localStorage.getItem('userSettings');
      const uiSettings = savedSettings ? JSON.parse(savedSettings) : {
        notifications: { email: true, sms: false, push: true },
        theme: 'light' as 'light' | 'dark' | 'auto',
        language: 'en',
        twoFactorEnabled: false
      };

      const userSettings: UserSettings = {
        email: profile.email || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        notifications: uiSettings.notifications || { email: true, sms: false, push: true },
        theme: uiSettings.theme || 'light',
        language: uiSettings.language || 'en',
        twoFactorEnabled: uiSettings.twoFactorEnabled || false
      };
      
      setSettings(userSettings);
      setOriginalSettings(userSettings);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const loadGeneratedQRCodes = async () => {
    try {
      // Use mock data for now since backend might not be ready
      const mockQRCodes: QRCodeData[] = [
        {
          id: '1',
          type: 'PROFILE',
          data: 'https://healthcare.com/profile/john-doe',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          type: 'APPOINTMENT',
          data: 'APT-2024-001',
          createdAt: '2024-01-16T14:20:00Z'
        }
      ];
      setGeneratedQRCodes(mockQRCodes);
    } catch (error) {
      console.error('Failed to load QR codes:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const updateData: any = {};
      
      if (originalSettings && settings.firstName !== originalSettings.firstName) {
        updateData.firstName = settings.firstName;
      }
      if (originalSettings && settings.lastName !== originalSettings.lastName) {
        updateData.lastName = settings.lastName;
      }
      if (originalSettings && settings.phone !== originalSettings.phone) {
        updateData.phone = settings.phone;
      }
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setOriginalSettings(settings);
      }
      
      const uiSettings = {
        notifications: settings.notifications,
        theme: settings.theme,
        language: settings.language,
        twoFactorEnabled: settings.twoFactorEnabled
      };
      localStorage.setItem('userSettings', JSON.stringify(uiSettings));
      
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Save settings error:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!qrData.trim()) {
      toast.error('Please enter data for QR code');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3002/api/settings/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: qrType,
          data: qrData
        })
      });

      // Check if the endpoint exists
      if (response.status === 404) {
        // If endpoint doesn't exist, create a mock QR code
        const mockQRCode: QRCodeData = {
          id: `QR-${Date.now()}`,
          type: qrType,
          data: qrData,
          createdAt: new Date().toISOString()
        };
        
        setGeneratedQRCodes(prev => [mockQRCode, ...prev]);
        setQrData('');
        toast.success('QR code created successfully (Demo Mode)');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate QR code' }));
        throw new Error(errorData.message || 'Failed to generate QR code');
      }

      const result = await response.json();
      
      // Add to generated QR codes list
      setGeneratedQRCodes(prev => [result.data, ...prev]);
      setQrData('');
      
      toast.success('QR code generated successfully');
    } catch (error: any) {
      console.error('QR generation error:', error);
      
      // If there's an error, still create a mock QR code for demo
      const mockQRCode: QRCodeData = {
        id: `QR-${Date.now()}`,
        type: qrType,
        data: qrData,
        createdAt: new Date().toISOString()
      };
      
      setGeneratedQRCodes(prev => [mockQRCode, ...prev]);
      setQrData('');
      toast.success('QR code created successfully (Demo Mode - Backend not available)');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = (qrCode: QRCodeData) => {
    if (qrCode.qrCode) {
      // If we have actual QR code data from backend
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrCode.qrCode}`;
      link.download = `qrcode-${qrCode.type}-${qrCode.id}.png`;
      link.click();
    } else {
      // For demo QR codes without actual image data
      toast.info('This is a demo QR code. Actual QR code image would be generated when backend is available.');
    }
  };

  const getQRTypeColor = (type: string) => {
    switch (type) {
      case 'PROFILE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'APPOINTMENT': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MEDICAL_RECORD': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const TabButton = ({ value, label, isActive }: { value: string; label: string; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  const hasChanges = originalSettings && (
    settings.firstName !== originalSettings.firstName ||
    settings.lastName !== originalSettings.lastName ||
    settings.phone !== originalSettings.phone
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <button 
          onClick={handleSaveSettings} 
          disabled={isLoading || !hasChanges}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {!hasChanges && originalSettings && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            No changes to save
          </p>
        </div>
      )}

      

      {/* Tabs Navigation */}
      <div className="flex space-x-2 mb-6">
        <TabButton value="general" label="General" isActive={activeTab === 'general'} />
        <TabButton value="notifications" label="Notifications" isActive={activeTab === 'notifications'} />
        <TabButton value="qr-generator" label="QR Generator" isActive={activeTab === 'qr-generator'} />
        <TabButton value="security" label="Security" isActive={activeTab === 'security'} />
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">General Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={settings.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={settings.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={settings.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="text"
                value={settings.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Theme
                </label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSettings(prev => ({ 
                    ...prev, 
                    theme: e.target.value as 'light' | 'dark' | 'auto' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { id: 'email-notifications', label: 'Email Notifications', description: 'Receive notifications via email', checked: settings.notifications.email, key: 'email' },
              { id: 'sms-notifications', label: 'SMS Notifications', description: 'Receive notifications via SMS', checked: settings.notifications.sms, key: 'sms' },
              { id: 'push-notifications', label: 'Push Notifications', description: 'Receive push notifications', checked: settings.notifications.push, key: 'push' }
            ].map(({ id, label, description, checked, key }) => (
              <div key={id} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, [key]: !checked }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Generator */}
      {activeTab === 'qr-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Generate QR Code</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="qr-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  QR Code Type
                </label>
                <select
                  id="qr-type"
                  value={qrType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQrType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="PROFILE">Profile QR</option>
                  <option value="APPOINTMENT">Appointment QR</option>
                  <option value="MEDICAL_RECORD">Medical Record QR</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="qr-data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {qrType === 'PROFILE' && 'Profile URL or Data'}
                  {qrType === 'APPOINTMENT' && 'Appointment ID or Details'}
                  {qrType === 'MEDICAL_RECORD' && 'Medical Record Reference'}
                </label>
                <input
                  id="qr-data"
                  type="text"
                  value={qrData}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQrData(e.target.value)}
                  placeholder={
                    qrType === 'PROFILE' ? 'https://healthcare.com/profile/your-id' :
                    qrType === 'APPOINTMENT' ? 'APT-2024-001' :
                    'MR-2024-001'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <button 
                onClick={generateQRCode} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Generated QR Codes</h2>
            <div className="space-y-4">
              {generatedQRCodes.map((qrCode) => (
                <div key={qrCode.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      {qrCode.qrCode ? (
                        <img 
                          src={`data:image/png;base64,${qrCode.qrCode}`} 
                          alt="QR Code" 
                          className="w-8 h-8"
                        />
                      ) : (
                        <span className="text-xs text-gray-600 dark:text-gray-300">QR</span>
                      )}
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getQRTypeColor(qrCode.type)}`}>
                        {qrCode.type.replace('_', ' ')}
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {qrCode.data}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(qrCode.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadQRCode(qrCode)}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-1 px-3 rounded text-sm transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
              
              {generatedQRCodes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No QR codes generated yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <label htmlFor="two-factor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Two-Factor Authentication
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Change Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <button className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors">
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;