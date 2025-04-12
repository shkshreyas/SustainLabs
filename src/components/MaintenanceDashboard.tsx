import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  Settings, 
  Plane,
  ChevronDown,
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react';
import SustainLabsHeader from './SustainLabsHeader';
import MobileNavigation from './MobileNavigation';

const MaintenanceDashboard = () => {
  // Sample data for the performance graph
  const performanceData = {
    labels: ['0:00', '7:00', '14:00', '21:00'],
    expected: [75, 85, 92, 78],
    actual: [70, 82, 88, 75]
  };

  // Status distribution data
  const statusData = [
    { status: 'Normal', count: 42, color: '#22c55e' },
    { status: 'Warning', count: 15, color: '#eab308' },
    { status: 'Critical', count: 8, color: '#ef4444' }
  ];

  // State for view type (Grid/List)
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  // State for panel type filter
  const [panelType, setPanelType] = useState('All Panels');
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white pb-16">
      {/* Header */}
      <SustainLabsHeader notificationCount={1} userInitial="A" />

      {/* Main content */}
      <main className="p-4">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Maintenance Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Track and diagnose performance degradation in solar panels and energy
            towers. Get AI-powered maintenance recommendations and schedule repairs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <button className="p-3 rounded-lg bg-gray-800">
            <Plane className="h-5 w-5 text-gray-400" />
          </button>
          <button className="p-3 rounded-lg bg-gray-800">
            <Bell className="h-5 w-5 text-gray-400" />
          </button>
          <button className="p-3 rounded-lg bg-gray-800">
            <Settings className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button 
              className={`flex-1 py-2 px-4 rounded-lg ${viewType === 'grid' ? 'bg-green-500' : 'text-gray-400'}`}
              onClick={() => setViewType('grid')}
            >
              Grid View
            </button>
            <button 
              className={`flex-1 py-2 px-4 rounded-lg ${viewType === 'list' ? 'bg-green-500' : 'text-gray-400'}`}
              onClick={() => setViewType('list')}
            >
              List View
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search panels..."
              className="w-full py-2 px-4 pr-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
          </div>

          <div className="relative">
            <button className="flex items-center gap-2 py-2 px-4 rounded-lg bg-gray-800 text-white">
              <span>All Panels</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <button className="py-2 px-4 rounded-lg bg-gray-800 flex items-center justify-center text-green-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
              <span>Performance Trends</span>
              <button className="text-gray-400 hover:text-white">
                <ChevronDown className="h-5 w-5" />
              </button>
            </h2>
            <div className="pt-6 pb-2">
              <div className="relative h-56">
                {/* Y-axis percentages */}
                <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-500">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                
                {/* Graph area */}
                <div className="absolute left-10 right-0 top-0 bottom-10 bg-gray-900/50 rounded">
                  {/* Expected line (blue area) */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={`M0,${100 - performanceData.expected[0]} ${performanceData.expected.map((val, i) => 
                        `L${(i / (performanceData.expected.length - 1)) * 100},${100 - val}`
                      ).join(' ')} L100,100 L0,100 Z`}
                      fill="rgba(59, 130, 246, 0.2)"
                    />
                  </svg>
                  
                  {/* Actual line (green) */}
                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={`M0,${100 - performanceData.actual[0]} ${performanceData.actual.map((val, i) => 
                        `L${(i / (performanceData.actual.length - 1)) * 100},${100 - val}`
                      ).join(' ')}`}
                      stroke="#22c55e"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                
                {/* X-axis time labels */}
                <div className="absolute left-10 right-0 bottom-0 text-xs text-gray-500 flex justify-between">
                  {performanceData.labels.map((label, index) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-2 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-blue-500 opacity-50 mr-2"></span>
                  <span>expected</span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                  <span>actual</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Status Distribution</h2>
            <div className="flex flex-col justify-center items-center h-48 gap-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center w-full gap-3">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div className="flex-1 flex justify-between items-center">
                    <span>{item.status}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Implementation Details Card */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">Implementation Time</div>
              <div className="text-lg">5 months</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Peak Reduction</div>
              <div className="text-lg text-green-400">24.9%</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Optimization Method</div>
              <div className="inline-block px-4 py-1 bg-gray-700 rounded-full text-sm">Cooling Optimization</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>2h left</span>
            </div>
            
            <button className="py-2 px-4 bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2 text-white">
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2 text-green-400">
            Subscribe to Our Newsletter and Get Updated bt our Latest Announcement
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 py-2 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button className="py-2 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium">
              Subscribe
            </button>
          </div>
        </div>

        {/* Company Information */}
        <div className="mt-6 py-4">
          <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2 mb-4">SusTainLabs</h3>
          <p className="text-gray-400 mb-6">
            Revolutionizing telecom energy consumption through innovative solutions and sustainable practices.
          </p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>7:54:43 AM</span>
          </div>
        </div>
      </main>

      {/* Quick Links Section */}
      <div className="p-4 border-t border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        {/* Quick links would go here */}
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default MaintenanceDashboard; 