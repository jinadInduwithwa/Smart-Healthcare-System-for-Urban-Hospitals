import { useState } from 'react';
import { FiCalendar, FiBook, FiUser, FiPlus, FiActivity, FiClock, FiCheckCircle, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '@/components/UI/Button';

const Overview = () => {
  const [stats] = useState([
    { title: 'Today\'s Appointments', value: 8, icon: FiCalendar, color: 'bg-blue-500' },
    { title: 'Pending Consultations', value: 3, icon: FiClock, color: 'bg-yellow-500' },
    { title: 'Completed Today', value: 5, icon: FiCheckCircle, color: 'bg-green-500' },
    { title: 'Total Patients', value: 124, icon: FiUser, color: 'bg-purple-500' },
  ]);

  const quickActions = [
    { title: 'Add New Consultation', icon: FiPlus, path: '/doctor-dashboard/add-consultation', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
    { title: 'View All Patients', icon: FiUser, path: '/doctor-dashboard/patient-records/all', color: 'bg-green-100 text-green-600 hover:bg-green-200' },
    { title: 'Today\'s Schedule', icon: FiCalendar, path: '/doctor-dashboard/appointments/schedule', color: 'bg-purple-100 text-purple-600 hover:bg-purple-200' },
    { title: 'Recent Records', icon: FiBook, path: '/doctor-dashboard/patient-records/all', color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' },
  ];

  const recentActivity = [
    { id: 1, patient: 'John Doe', action: 'Consultation completed', time: '2 hours ago' },
    { id: 2, patient: 'Jane Smith', action: 'New appointment scheduled', time: '4 hours ago' },
    { id: 3, patient: 'Robert Johnson', action: 'Prescription updated', time: '1 day ago' },
    { id: 4, patient: 'Emily Davis', action: 'Lab results reviewed', time: '1 day ago' },
  ];

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Doctor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <Icon className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions and Search Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link 
                  key={index} 
                  to={action.path}
                  className={`${action.color} rounded-lg p-5 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-md`}
                >
                  <Icon className="text-2xl mb-2" />
                  <span className="font-medium text-center">{action.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search Card */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Patient Search</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
                <FiSearch className="text-blue-600 dark:text-blue-300 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Find Patient Records</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-4">
                Quickly access patient information by scanning QR codes or searching by ID
              </p>
              <Link to="/doctor-dashboard/patient-records/card">
                <Button variant="primary" className="w-full">
                  Scan Patient QR
                </Button>
              </Link>
              <div className="mt-3 w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Patient ID or Name"
                    className="w-full p-3 pl-10 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                  <FiActivity className="text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">{activity.patient}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{activity.action}</p>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-800 dark:text-white">Patient Name</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">10:30 AM - 11:00 AM</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="text-xs px-3 py-1"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;