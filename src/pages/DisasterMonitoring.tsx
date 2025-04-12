import React, { useState, useEffect, useRef } from 'react';
import HeatMap from '../components/HeatMap';
import { useDataStore } from '../store/dataStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import AIRecommendations from '../components/AIRecommendations';
import MachinePartsMonitor from '../components/MachinePartsMonitor';
import PowerSupplyMonitor from '../components/PowerSupplyMonitor';
import { Activity, AlertTriangle, Settings, Zap, Power, Wind, Cpu, Database, BarChart2, Layers } from 'lucide-react';

// Tab options for the dashboard
type TabOption = 'overview' | 'equipment' | 'power' | 'health' | 'ai';

const DisasterMonitoring: React.FC = () => {
  const { sites, isLoading, runDisasterAnalysis } = useDataStore();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [centerCoordinates, setCenterCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [zoom, setZoom] = useState<number>(4);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabOption>('overview');
  const [preDisasterData, setPreDisasterData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sustainabilityScore, setSustainabilityScore] = useState<number>(75);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock historical data for comparison
  const [historicalData, setHistoricalData] = useState(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).getTime();
    return Array.from({ length: 24 }, (_, i) => ({
      time: new Date(fiveMinutesAgo + i * 60 * 1000).toLocaleTimeString(),
      consumption: Math.random() * 50 + 100,
      efficiency: Math.random() * 20 + 70,
      renewable: Math.random() * 30 + 20,
      grid: Math.random() * 40 + 60,
    }));
  });

  // Monitor real-time updates with interval
  useEffect(() => {
    // Start the real-time data simulation
    updateTimerRef.current = setInterval(() => {
      // Add a new data point to historical data
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        consumption: Math.random() * 50 + 100,
        efficiency: Math.random() * 20 + 70,
        renewable: Math.random() * 30 + 20,
        grid: Math.random() * 40 + 60,
      };
      
      setHistoricalData(prev => [...prev.slice(1), newDataPoint]);
      setLastUpdated(new Date());
      
      // Simulate small changes to sustainability score
      setSustainabilityScore(prev => 
        Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2))
      );
    }, 5000); // Update every 5 seconds

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSite && sites.length > 0) {
      const site = sites.find(s => s.id === selectedSite);
      if (site) {
        setCenterCoordinates({
          lat: site.location.lat,
          lng: site.location.lng
        });
        setZoom(15); // Zoom in on the selected site
      }
    } else if (sites.length > 0) {
      // Default: center on the average coordinates of all sites
      const avgLat = sites.reduce((sum, site) => sum + site.location.lat, 0) / sites.length;
      const avgLng = sites.reduce((sum, site) => sum + site.location.lng, 0) / sites.length;
      setCenterCoordinates({ lat: avgLat, lng: avgLng });
      setZoom(4);
    }
  }, [selectedSite, sites]);

  // Calculate site health and anomalies
  const sitesWithHealth = sites.map(site => {
    const latestData = site.energyData[site.energyData.length - 1];
    const efficiency = latestData.efficiency;
    const anomalyScore = (100 - efficiency) * (latestData.consumption / 100);
    
    let healthStatus = 'Healthy';
    let statusColor = 'text-success';
    
    if (anomalyScore > 80) {
      healthStatus = 'Critical';
      statusColor = 'text-error';
    } else if (anomalyScore > 40) {
      healthStatus = 'Warning';
      statusColor = 'text-warning';
    }
    
    return {
      ...site,
      healthStatus,
      statusColor,
      anomalyScore
    };
  });
  
  // Sort by anomaly score (highest first) to prioritize troubled sites
  const sortedSites = [...sitesWithHealth].sort((a, b) => b.anomalyScore - a.anomalyScore);

  const handleSimulateDisaster = async () => {
    // Store pre-disaster data for comparison
    setPreDisasterData(sites.map(site => ({
      id: site.id,
      name: site.name,
      consumption: site.energyData[site.energyData.length - 1].consumption,
      efficiency: site.energyData[site.energyData.length - 1].efficiency,
      timestamp: Date.now()
    })));

    setIsSimulating(true);
    await runDisasterAnalysis();
    setIsSimulating(false);
  };

  // Calculate total energy stats
  const totalConsumption = sites.reduce(
    (sum, site) => sum + site.energyData[site.energyData.length - 1].consumption, 
    0
  ).toFixed(2);
  
  const avgEfficiency = (sites.reduce(
    (sum, site) => sum + site.energyData[site.energyData.length - 1].efficiency, 
    0
  ) / (sites.length || 1)).toFixed(1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <span className="ml-3">Loading site data...</span>
      </div>
    );
  }

  // Mobile view rendering
  const renderMobileView = () => (
    <div className="flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 text-white min-h-screen">
      {/* Header */}
      <div className="p-4 pt-5 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Disaster Energy Monitoring</h1>
            <p className="text-xs opacity-80 mt-1">
              Monitor energy consumption and equipment health after disasters to identify issues.
            </p>
          </div>
          <Settings className="h-5 w-5 text-white/80" />
        </div>

        <button 
          className={`btn btn-sm btn-error w-full mt-3 ${isSimulating ? 'loading' : ''}`}
          onClick={handleSimulateDisaster}
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating...' : 'Simulate Disaster Impact'}
        </button>

        <div className="text-xs opacity-70 mt-2 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Sites List */}
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold mb-2">Sites</h2>
        <div className="space-y-2">
          {sortedSites.slice(0, 3).map(site => (
            <div 
              key={site.id}
              className={`p-2 rounded-md cursor-pointer bg-white/10 border-l-4 ${
                site.healthStatus === 'Critical' ? 'border-error' : 
                site.healthStatus === 'Warning' ? 'border-warning' : 'border-success'
              }`}
              onClick={() => setSelectedSite(site.id === selectedSite ? null : site.id)}
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">{site.name}</h4>
                <span className={`text-xs ${site.statusColor}`}>{site.healthStatus}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1 opacity-80">
                <span>{site.location.address}</span>
                <span>Efficiency: {site.energyData[site.energyData.length - 1].efficiency.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    site.healthStatus === 'Critical' ? 'bg-error' : 
                    site.healthStatus === 'Warning' ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{width: `${Math.min(100, site.energyData[site.energyData.length - 1].efficiency)}%`}}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel History */}
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold mb-1">Channel History</h2>
        <div className="bg-white/10 p-2 rounded-md">
          <div className="text-xs opacity-80 mb-1">System-wide Energy Matrix</div>
          <div className="flex space-x-1">
            <div className="text-xs opacity-80">Efficiency:</div>
            <div className="font-medium text-xs">{avgEfficiency}%</div>
            <div className="text-xs opacity-80 ml-3">Type:</div>
            <div className="font-medium text-xs">Power Tower Substation</div>
          </div>
          <div className="mt-1 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-success"
              style={{width: `${avgEfficiency}%`}}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-between px-3 py-2 mt-2 border-t border-white/10">
        <button 
          className={`flex flex-col items-center px-2 py-1 ${activeTab === 'overview' ? 'text-green-300' : 'text-white/70'}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity className="h-4 w-4" />
          <span className="text-xs mt-1">Overview</span>
        </button>
        <button 
          className={`flex flex-col items-center px-2 py-1 ${activeTab === 'equipment' ? 'text-green-300' : 'text-white/70'}`}
          onClick={() => setActiveTab('equipment')}
        >
          <Cpu className="h-4 w-4" />
          <span className="text-xs mt-1">Equipment</span>
        </button>
        <button 
          className={`flex flex-col items-center px-2 py-1 ${activeTab === 'power' ? 'text-green-300' : 'text-white/70'}`}
          onClick={() => setActiveTab('power')}
        >
          <Power className="h-4 w-4" />
          <span className="text-xs mt-1">Power</span>
        </button>
        <button 
          className={`flex flex-col items-center px-2 py-1 ${activeTab === 'health' ? 'text-green-300' : 'text-white/70'}`}
          onClick={() => setActiveTab('health')}
        >
          <Database className="h-4 w-4" />
          <span className="text-xs mt-1">Health</span>
        </button>
        <button 
          className={`flex flex-col items-center px-2 py-1 ${activeTab === 'ai' ? 'text-green-300' : 'text-white/70'}`}
          onClick={() => setActiveTab('ai')}
        >
          <Zap className="h-4 w-4" />
          <span className="text-xs mt-1">AI</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold mb-2">Total Energy Consumption</h2>
        <div className="text-2xl font-bold text-green-400">
          {totalConsumption}
          <span className="text-sm opacity-80 ml-1">kWh across all sites</span>
        </div>

        <h2 className="text-sm font-semibold mt-4 mb-2">Average Efficiency</h2>
        <div className="text-2xl font-bold text-cyan-400">
          {avgEfficiency}%
          <span className="text-sm opacity-80 ml-1">System wide</span>
        </div>

        <h2 className="text-sm font-semibold mt-4 mb-2">Critical Sites</h2>
        <div className="text-2xl font-bold text-red-400">
          {sortedSites.filter(site => site.healthStatus === 'Critical').length}
          <span className="text-sm opacity-80 ml-1">Require immediate repair</span>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-10">
        <button className="btn btn-circle btn-primary shadow-lg">
          <AlertTriangle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  // Desktop view rendering
  return isMobile ? renderMobileView() : (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Disaster Energy Monitoring</h1>
            <p className="text-base-content/70">
              Monitor energy consumption and equipment health after disasters to identify issues.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              className={`btn btn-error ${isSimulating ? 'loading' : ''}`}
              onClick={handleSimulateDisaster}
              disabled={isSimulating}
            >
              {isSimulating ? 'Simulating...' : 'Simulate Disaster Impact'}
            </button>
            
            <div className="badge badge-neutral">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Sites</h2>
                
                <div className="overflow-y-auto max-h-[350px] pr-2">
                  {sortedSites.map(site => (
                    <div 
                      key={site.id}
                      className={`mb-2 p-3 rounded-md cursor-pointer border-l-4 ${
                        selectedSite === site.id ? 'bg-base-200' : 'bg-base-100'
                      } ${
                        site.healthStatus === 'Critical' ? 'border-error' : 
                        site.healthStatus === 'Warning' ? 'border-warning' : 'border-success'
                      }`}
                      onClick={() => setSelectedSite(site.id === selectedSite ? null : site.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{site.name}</h4>
                        <span className={`badge ${site.statusColor}`}>{site.healthStatus}</span>
                      </div>
                      <p className="text-sm text-base-content/70">{site.location.address}</p>
                      <div className="mt-2 text-xs flex justify-between">
                        <span>Efficiency: {site.energyData[site.energyData.length - 1].efficiency.toFixed(1)}%</span>
                        <span>Type: {site.type}</span>
                      </div>
                      <div className="mt-2 h-1 w-full bg-base-300 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            site.healthStatus === 'Critical' ? 'bg-error' : 
                            site.healthStatus === 'Warning' ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{width: `${Math.min(100, site.energyData[site.energyData.length - 1].efficiency)}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="tabs tabs-boxed mb-4">
              <a 
                className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </a>
              <a 
                className={`tab ${activeTab === 'equipment' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('equipment')}
              >
                Equipment Health
              </a>
              <a 
                className={`tab ${activeTab === 'power' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('power')}
              >
                Power Supply
              </a>
              <a 
                className={`tab ${activeTab === 'health' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('health')}
              >
                System Health
              </a>
              <a 
                className={`tab ${activeTab === 'ai' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                AI Recommendations
              </a>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Total Energy Consumption</div>
                <div className="stat-value text-primary">{totalConsumption}</div>
                <div className="stat-desc">kWh across all sites</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Average Efficiency</div>
                <div className="stat-value text-secondary">{avgEfficiency}%</div>
                <div className="stat-desc">System wide</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Critical Sites</div>
                <div className="stat-value text-error">
                  {sortedSites.filter(site => site.healthStatus === 'Critical').length}
                </div>
                <div className="stat-desc">Require immediate repair</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Sustainability Score</div>
                <div className="stat-value text-accent">{sustainabilityScore.toFixed(1)}</div>
                <div className="stat-desc">
                  <progress 
                    className={`progress ${sustainabilityScore > 80 ? 'progress-success' : 
                                         sustainabilityScore > 60 ? 'progress-accent' : 
                                         sustainabilityScore > 40 ? 'progress-warning' : 'progress-error'}`} 
                    value={sustainabilityScore} 
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
            
            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-base-100 p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-2">Real-time Energy Consumption</h3>
                  <p className="text-sm text-base-content/70 mb-3">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="consumption" stroke="#F87272" fill="#F87272" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="grid" stroke="#3ABFF8" fill="#3ABFF8" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="renewable" stroke="#36D399" fill="#36D399" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-base-100 p-4 rounded-lg shadow-md mt-6">
                  <h3 className="text-lg font-bold mb-2">System Efficiency Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#FBBD23" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Heat Map */}
                {centerCoordinates && (
                  <div className="mt-6">
                    <HeatMap 
                      centerLat={centerCoordinates.lat}
                      centerLng={centerCoordinates.lng}
                      zoom={zoom}
                      showDisasterMode={true}
                    />
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'equipment' && <MachinePartsMonitor selectedSiteId={selectedSite} />}
            {activeTab === 'power' && <PowerSupplyMonitor selectedSiteId={selectedSite} />}
            {activeTab === 'ai' && <AIRecommendations sites={sortedSites} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterMonitoring; 