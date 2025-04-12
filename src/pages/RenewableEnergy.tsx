import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, BarChart } from '@tremor/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sun, Wind, Battery, Zap, AlertTriangle, CloudRain, Thermometer, Download, TrendingUp, Calendar, DollarSign, IndianRupee } from 'lucide-react';
import { faker } from '@faker-js/faker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generateEnergyData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    solar: faker.number.int({ min: 20, max: 100 }),
    wind: faker.number.int({ min: 15, max: 80 }),
    battery: faker.number.int({ min: 10, max: 60 }),
    consumption: faker.number.int({ min: 30, max: 90 }),
    cost: faker.number.int({ min: 50, max: 200 })
  }));
};

const weatherData = {
  temperature: '24°C',
  humidity: '65%',
  windSpeed: '12 km/h',
  forecast: 'Partly Cloudy'
};

const aiRecommendations = [
  {
    title: 'Dynamic Load Balancing Optimization',
    description: 'Implement ML-powered load balancing system to distribute energy based on predicted demand patterns',
    impact: 'Estimated 18% increase in grid efficiency',
    priority: 'High',
    roi: '3.5 months',
    analysis: 'Based on historical data patterns and weather forecasts, implementing dynamic load balancing could significantly reduce energy waste during peak hours.',
    steps: [
      'Deploy IoT sensors across the grid',
      'Install ML-based prediction system',
      'Configure automated load distribution',
      'Monitor and optimize thresholds'
    ]
  },
  {
    title: 'Predictive Maintenance Protocol',
    description: 'Deploy AI-driven maintenance scheduling using vibration analysis and thermal imaging',
    impact: 'Reduce downtime by 45%, extend equipment life by 25%',
    priority: 'High',
    roi: '5 months',
    analysis: 'Current reactive maintenance patterns show significant efficiency losses. Predictive maintenance could prevent 85% of potential failures.',
    steps: [
      'Install vibration sensors',
      'Deploy thermal cameras',
      'Implement AI analysis system',
      'Train maintenance team'
    ]
  },
  {
    title: 'Weather-Adaptive Solar Tracking',
    description: 'Enhanced solar tracking algorithm incorporating real-time weather data and sun position',
    impact: 'Potential 22% increase in solar collection efficiency',
    priority: 'Medium',
    roi: '4 months',
    analysis: 'Current fixed tracking patterns miss optimal angles during varying weather conditions. Advanced tracking could capture significantly more energy.',
    steps: [
      'Update tracking software',
      'Install weather sensors',
      'Calibrate tracking algorithms',
      'Monitor performance metrics'
    ]
  }
];

const systemAlerts = [
  {
    title: 'Severe Weather Alert',
    description: 'Incoming storm system detected. Implementing protective measures for wind turbines.',
    time: '30 minutes ago',
    type: 'warning',
    impact: 'Potential 20% reduction in wind power output',
    action: 'Automated safety protocols initiated'
  },
  {
    title: 'Grid Stability Notice',
    description: 'Unusual voltage fluctuations detected in sector 3',
    time: '2 hours ago',
    type: 'info',
    impact: 'Minor system inefficiency detected',
    action: 'Diagnostic scan in progress'
  },
  {
    title: 'Maintenance Alert',
    description: 'Solar panel array 5 showing signs of degraded performance',
    time: '4 hours ago',
    type: 'warning',
    impact: '5% reduction in array efficiency',
    action: 'Scheduled for inspection within 24 hours'
  }
];

const RenewableEnergy = () => {
  const [energyData, setEnergyData] = useState(generateEnergyData());
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedView, setSelectedView] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [selectedEnergyChart, setSelectedEnergyChart] = useState('area');
  const [showProductionLegend, setShowProductionLegend] = useState(true);
  const [selectedDistributionView, setSelectedDistributionView] = useState('donut');
  const [showForecastDetails, setShowForecastDetails] = useState(false);
  
  // Add refs for the charts
  const areaChartRef = useRef<HTMLDivElement>(null);
  const donutChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);

  // Define vibrant color scheme for the charts
  const colorScheme = {
    solar: '#FFB800', // Bright gold
    wind: '#0088FF',  // Bright blue
    battery: '#00D084', // Vibrant green
    predicted: '#9C6CFF', // Vibrant purple
    optimized: '#956E99', // Vibrant pink
    consumption: '#FF4572', // Bright raspberry
    background: {
      solar: 'rgba(255, 184, 0, 0.15)',
      wind: 'rgba(0, 136, 255, 0.15)',
      battery: 'rgba(0, 208, 132, 0.15)',
      predicted: 'rgba(156, 108, 255, 0.15)',
      optimized: 'rgba(255, 94, 159, 0.15)',
      consumption: 'rgba(255, 69, 114, 0.15)'
    }
  };

  // Replace the RenewableEnergy component
  const generateRealData = () => {
    const data = [];
    
    // Create more realistic 24-hour data pattern
    for (let i = 0; i < 24; i++) {
      // Solar is highest during midday (bell curve)
      const solarValue = i >= 6 && i <= 18 
        ? 30 + Math.round(Math.sin((i-6) * Math.PI/12) * 70)
        : Math.round(Math.random() * 10);
        
      // Wind tends to be stronger in mornings and evenings
      const windValue = (i <= 8 || i >= 16) 
        ? 40 + Math.round(Math.random() * 40)
        : 20 + Math.round(Math.random() * 30);
        
      // Battery usage peaks in evening when solar drops
      const batteryValue = i >= 16 || i <= 5
        ? 30 + Math.round(Math.random() * 30)
        : 10 + Math.round(Math.random() * 15);
        
      // Consumption is higher in mornings and evenings
      const consumptionValue = (i >= 6 && i <= 9) || (i >= 17 && i <= 22)
        ? 70 + Math.round(Math.random() * 20)
        : 30 + Math.round(Math.random() * 30);
      
      const optimizedUsageValue = consumptionValue * (0.7 + (Math.random() * 0.1));
      
      data.push({
        time: `${i}:00`,
        solar: solarValue,
        wind: windValue,
        battery: batteryValue,
        consumption: consumptionValue,
        predictedUsage: consumptionValue * (1 + (Math.random() * 0.1)),
        optimizedUsage: optimizedUsageValue,
        cost: Math.round((consumptionValue * 2) + (Math.random() * 30))
      });
    }
    
    return data;
  };
  
  // Set more accurate data on initial load
  useEffect(() => {
    setEnergyData(generateRealData());
  }, []);
  
  // Original useEffect for data refresh - change to 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyData(generateRealData());
    }, 5000); // Changed from 30000 to 5000 (5 seconds)

    return () => clearInterval(interval);
  }, []);

  // Update useEffect to style SVG elements including recharts-sector
  useEffect(() => {
    // Function to apply styling to chart SVG elements
    const styleChartSvg = () => {
      // Style area chart
      if (areaChartRef.current) {
        const areaSvg = areaChartRef.current.querySelector('.recharts-surface');
        if (areaSvg) {
          (areaSvg as HTMLElement).style.background = 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,184,0,0.05) 100%)';
          (areaSvg as HTMLElement).style.borderRadius = '12px';
          (areaSvg as HTMLElement).style.filter = 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))';
        }
        
        // Add specific classes to area paths
        const areaPaths = areaChartRef.current.querySelectorAll('.recharts-curve.recharts-area-area');
        const areaStrokes = areaChartRef.current.querySelectorAll('.recharts-curve.recharts-area-curve');
        
        if (areaPaths.length >= 3 && areaStrokes.length >= 3) {
          // Add classes for area fills
          areaPaths[0]?.classList.add('solar-area');
          areaPaths[1]?.classList.add('wind-area');
          areaPaths[2]?.classList.add('battery-area');
          
          // Add classes for area strokes
          areaStrokes[0]?.classList.add('solar-stroke');
          areaStrokes[1]?.classList.add('wind-stroke');
          areaStrokes[2]?.classList.add('battery-stroke');
        }
      }
      
      // Style pie chart container with 3D effect
      if (donutChartRef.current) {
        const pieSvg = donutChartRef.current.querySelector('.recharts-surface');
        if (pieSvg) {
          (pieSvg as HTMLElement).style.background = 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.02) 100%)';
          (pieSvg as HTMLElement).style.filter = 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))';
        }
        
        // Add advanced 3D-like hover effects to sectors
        const sectors = donutChartRef.current.querySelectorAll('.recharts-sector');
        sectors.forEach((sector, index) => {
          // Add transition for smooth animations
          (sector as HTMLElement).style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          
          // Create hover effect
          sector.addEventListener('mouseenter', () => {
            (sector as HTMLElement).style.transform = 'translateY(-5px) scale(1.05)';
            (sector as HTMLElement).style.filter = `drop-shadow(0px 6px 8px rgba(0,0,0,0.25))`;
            (sector as HTMLElement).style.cursor = 'pointer';
          });
          
          sector.addEventListener('mouseleave', () => {
            (sector as HTMLElement).style.transform = 'translateY(0) scale(1)';
            (sector as HTMLElement).style.filter = 'none';
          });
        });
        
        // Add pulse effect to the central circle
        const centralCircle = donutChartRef.current.querySelector('.absolute .bg-base-200\\/60');
        if (centralCircle) {
          (centralCircle as HTMLElement).style.animation = 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite';
          (centralCircle as HTMLElement).style.boxShadow = 'inset 0 0 15px rgba(0,0,0,0.1)';
        }
      }
      
      // Style bar chart
      if (barChartRef.current) {
        const barSvg = barChartRef.current.querySelector('.recharts-surface');
        if (barSvg) {
          (barSvg as HTMLElement).style.background = 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(147,51,234,0.05) 100%)';
          (barSvg as HTMLElement).style.borderRadius = '12px';
          (barSvg as HTMLElement).style.filter = 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))';
        }
      }
    };
    
    // Apply styling after a short delay to ensure components are rendered
    const timer = setTimeout(() => {
      styleChartSvg();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [energyData, colorScheme]); // Re-apply when data or colorScheme changes

  // Fix the TypeScript errors by properly casting the DOM elements
  useEffect(() => {
    // Function to apply styling to bar chart rectangles
    const styleBarRectangles = () => {
      if (barChartRef.current) {
        // Select all rectangles in the bar chart
        const rectangles = barChartRef.current.querySelectorAll('.recharts-rectangle');
        rectangles.forEach((rect, index) => {
          // Apply custom classes based on data category
          if (index % 2 === 0) {
            rect.classList.add('consumption-bar');
          } else {
            rect.classList.add('optimized-bar');
          }
          
          // Add hover effect with proper TypeScript casting
          rect.addEventListener('mouseenter', () => {
            (rect as HTMLElement).style.opacity = '0.9';
            (rect as HTMLElement).style.transform = 'translateY(-2px)';
            (rect as HTMLElement).style.transition = 'all 0.3s ease';
          });
          
          rect.addEventListener('mouseleave', () => {
            (rect as HTMLElement).style.opacity = '1';
            (rect as HTMLElement).style.transform = 'translateY(0)';
          });
        });
      }
    };
    
    // Apply styling after a short delay to ensure components are rendered
    const timer = setTimeout(() => {
      styleBarRectangles();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [energyData]); // Re-apply when data changes

  const generateReport = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Renewable Energy System Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

      // System Overview
      doc.setFontSize(16);
      doc.text('System Overview', 20, 45);
      const metrics = [
        ['Total Power Output', '198.8 kW'],
        ['System Efficiency', '94.2%'],
        ['Carbon Offset', '2.4 tons'],
        ['Cost Savings', '₹342.50/day']
      ];
      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: metrics
      });

      // Energy Sources
      doc.setFontSize(16);
      doc.text('Energy Sources', 20, doc.lastAutoTable.finalY + 20);
      const sources = [
        ['Solar Power', '45.2 kW', '87%'],
        ['Wind Power', '32.8 kW', '78%'],
        ['Battery Storage', '120 kWh', '92%']
      ];
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Source', 'Output', 'Efficiency']],
        body: sources
      });

      // AI Recommendations
      doc.setFontSize(16);
      doc.text('AI Recommendations', 20, doc.lastAutoTable.finalY + 20);
      const recommendations = aiRecommendations.map(rec => [
        rec.title,
        rec.impact,
        rec.roi
      ]);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Recommendation', 'Impact', 'ROI']],
        body: recommendations
      });

      // System Alerts
      doc.setFontSize(16);
      doc.text('Active System Alerts', 20, doc.lastAutoTable.finalY + 20);
      const alerts = systemAlerts.map(alert => [
        alert.title,
        alert.description,
        alert.impact
      ]);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Alert', 'Description', 'Impact']],
        body: alerts
      });

      doc.save('renewable-energy-report.pdf');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const TimeRangeSelector = () => (
    <div className="flex gap-2">
      {['24h', '7d', '30d', '1y'].map((range) => (
        <button
          key={range}
          onClick={() => setSelectedTimeRange(range)}
          className={`btn ${selectedTimeRange === range ? 'btn-primary' : 'btn-ghost'}`}
        >
          {range}
        </button>
      ))}
    </div>
  );

  const ViewSelector = () => (
    <div className="flex gap-2">
      {['overview', 'detailed', 'analytics'].map((view) => (
        <button
          key={view}
          onClick={() => setSelectedView(view)}
          className={`btn ${selectedView === view ? 'btn-secondary' : 'btn-ghost'}`}
        >
          {view}
        </button>
      ))}
    </div>
  );

  const WeatherWidget = () => (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <CloudRain className="w-6 h-6 text-primary" />
          Weather Conditions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-error" />
            <span>{weatherData.temperature}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-info" />
            <span>{weatherData.windSpeed}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const EnergySourceCard = ({ source }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card bg-base-200 shadow-xl"
    >
      <div className="card-body">
        <div className="flex justify-between items-center">
          <source.icon className={`w-8 h-8 ${source.color}`} />
          <div className={`badge ${
            source.status === 'Optimal' ? 'badge-success' :
            source.status === 'Good' ? 'badge-info' :
            'badge-warning'
          }`}>
            {source.status}
          </div>
        </div>
        <h2 className="card-title mt-4">{source.value}</h2>
        <p className="text-base-content/70">{source.title}</p>
        <div className="mt-4 pt-4 border-t border-base-300">
          <div className="flex justify-between items-center mb-2">
            <span>Efficiency</span>
            <span>{source.efficiency}</span>
          </div>
          <progress 
            className={`progress ${
              parseInt(source.efficiency) > 85 ? 'progress-success' :
              parseInt(source.efficiency) > 70 ? 'progress-warning' :
              'progress-error'
            }`} 
            value={parseInt(source.efficiency)} 
            max="100"
          ></progress>
        </div>
      </div>
    </motion.div>
  );

  const RecommendationsCard = () => (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">AI-Driven Recommendations</h2>
          <Zap className="w-6 h-6 text-warning" />
        </div>
        <div className="space-y-4 mt-4">
          {aiRecommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              className="collapse collapse-plus bg-base-300"
              whileHover={{ scale: 1.01 }}
            >
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium flex justify-between items-center">
                <span>{recommendation.title}</span>
                <span className={`badge ${
                  recommendation.priority === 'High' ? 'badge-error' :
                  recommendation.priority === 'Medium' ? 'badge-warning' :
                  'badge-success'
                }`}>
                  {recommendation.priority} Priority
                </span>
              </div>
              <div className="collapse-content">
                <p className="mt-2">{recommendation.description}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-success">{recommendation.impact}</p>
                  <p className="text-info">ROI: {recommendation.roi}</p>
                  <div className="mt-4">
                    <p className="font-semibold">Analysis:</p>
                    <p>{recommendation.analysis}</p>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold">Implementation Steps:</p>
                    <ul className="list-disc list-inside">
                      {recommendation.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const AlertsCard = () => (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">System Alerts</h2>
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div className="space-y-4 mt-4">
          {systemAlerts.map((alert, index) => (
            <motion.div
              key={index}
              className="alert shadow-lg"
              whileHover={{ scale: 1.01 }}
            >
              <div>
                <AlertTriangle className={`w-6 h-6 ${
                  alert.type === 'warning' ? 'text-warning' : 'text-info'
                }`} />
                <div>
                  <h3 className="font-bold">{alert.title}</h3>
                  <div className="text-xs">{alert.description}</div>
                </div>
              </div>
              <span className="text-xs opacity-70">{alert.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Renewable Energy Command Center</h1>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            Advanced monitoring and optimization platform for renewable energy systems.
            Real-time insights and AI-driven recommendations for maximum efficiency.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <TimeRangeSelector />
          <ViewSelector />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <WeatherWidget />
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-figure text-success">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div className="stat-title">Cost Savings Today</div>
              <div className="stat-value text-success text-xl md:text-2xl">₹342.50</div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-figure text-info">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="stat-title">Efficiency Rate</div>
              <div className="stat-value text-info">94.2%</div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="stat-title">Carbon Offset</div>
              <div className="stat-value text-primary">2.4 tons</div>
            </div>
          </div>
        </div>

        {/* Energy Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Solar Power',
              value: '45.2 kW',
              efficiency: '87%',
              status: 'Optimal',
              icon: Sun,
              color: 'text-warning'
            },
            {
              title: 'Wind Power',
              value: '32.8 kW',
              efficiency: '78%',
              status: 'Good',
              icon: Wind,
              color: 'text-info'
            },
            {
              title: 'Battery Storage',
              value: '120 kWh',
              efficiency: '92%',
              status: 'Charging',
              icon: Battery,
              color: 'text-success'
            }
          ].map((source, index) => (
            <EnergySourceCard key={index} source={source} />
          ))}
        </div>

        {/* ENHANCED CHARTS - Updated with vibrant colors and SVG styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Energy Production Chart */}
          <div className="card bg-base-200/80 shadow-xl overflow-hidden border border-primary/10 hover:shadow-2xl transition-all duration-500">
            <div className="card-body p-5">
              <h2 className="card-title text-primary-content mb-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-warning animate-pulse" />
                Energy Production
              </h2>
              
              <div className="relative rounded-lg overflow-hidden" ref={areaChartRef}>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/90 z-0"
                />
                
                <div className="relative z-10 h-80">
                  <AreaChart
                    className="h-80 mt-2"
                    data={energyData}
                    index="time"
                    categories={['solar', 'wind', 'battery']}
                    colors={[colorScheme.solar, colorScheme.wind, colorScheme.battery]}
                    valueFormatter={(value) => `${value} kW`}
                    showLegend={true}
                    showGridLines={false}
                    showAnimation={true}
                    showXAxis={true}
                    showYAxis={true}
                    autoMinValue={true}
                    minValue={0}
                    yAxisWidth={40}
                    onValueChange={(v) => {
                      console.log('Hover value:', v);
                    }}
                  />
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="p-1 rounded-full bg-gray-700/50 text-gray-200 cursor-pointer backdrop-blur-sm"
                      onClick={() => setSelectedEnergyChart('area')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3v18h18" />
                        <path d="M3 15l7-3 5 3 6-6" />
                      </svg>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="p-1 rounded-full bg-gray-700/50 text-gray-200 cursor-pointer backdrop-blur-sm"
                      onClick={() => setSelectedEnergyChart('line')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3v18h18" />
                        <path d="M3 12l5-5 5 5 8-8" />
                      </svg>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 text-white text-xs font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorScheme.solar }}></div>
                      <span>Max Solar: {energyData.reduce((max, item) => Math.max(max, item.solar), 0)} kW</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorScheme.wind }}></div>
                      <span>Max Wind: {energyData.reduce((max, item) => Math.max(max, item.wind), 0)} kW</span>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 dark:from-yellow-900/30 dark:to-yellow-700/20 rounded-xl p-3 shadow-lg border border-yellow-500/20"
                >
                  <div className="relative mb-2">
                    <Sun className="w-8 h-8 text-yellow-500 relative z-10" />
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full filter blur-md animate-pulse"></div>
                  </div>
                  <span className="text-xs opacity-70">Solar</span>
                  <motion.span 
                    className="text-xl font-bold text-yellow-600 dark:text-yellow-400"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / energyData.length)}kW
                  </motion.span>
                  <div className="w-full h-1 bg-gray-200/30 dark:bg-gray-700/30 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/30 dark:to-blue-700/20 rounded-xl p-3 shadow-lg border border-blue-500/20"
                >
                  <div className="relative mb-2">
                    <Wind className="w-8 h-8 text-blue-500 relative z-10" />
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full filter blur-md animate-pulse"></div>
                  </div>
                  <span className="text-xs opacity-70">Wind</span>
                  <motion.span 
                    className="text-xl font-bold text-blue-600 dark:text-blue-400"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / energyData.length)}kW
                  </motion.span>
                  <div className="w-full h-1 bg-gray-200/30 dark:bg-gray-700/30 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-900/30 dark:to-green-700/20 rounded-xl p-3 shadow-lg border border-green-500/20"
                >
                  <div className="relative mb-2">
                    <Battery className="w-8 h-8 text-green-500 relative z-10" />
                    <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-md animate-pulse"></div>
                  </div>
                  <span className="text-xs opacity-70">Battery</span>
                  <motion.span 
                    className="text-xl font-bold text-green-600 dark:text-green-400"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / energyData.length)}kW
                  </motion.span>
                  <div className="w-full h-1 bg-gray-200/30 dark:bg-gray-700/30 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-4 p-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 text-sm text-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium">Current Peak Time:</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    {energyData.reduce((highest, item, index, arr) => {
                      const total = item.solar + item.wind + item.battery;
                      return total > (arr[highest]?.solar + arr[highest]?.wind + arr[highest]?.battery) ? index : highest;
                    }, 0) || 0}:00
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">Total Energy Today:</span>
                  </div>
                  <span className="font-bold text-blue-400">
                    {Math.round(energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) / 24)} kWh
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Enhanced Energy Distribution Chart */}
          <div className="card bg-base-200/80 shadow-xl overflow-hidden border border-secondary/10">
            <div className="card-body p-5">
              <h2 className="card-title text-secondary-content mb-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-secondary" />
                Energy Distribution
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-72 w-72" ref={donutChartRef}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="2" floodOpacity="0.3" />
                          </filter>
                          <linearGradient id="solarGradient2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={`${colorScheme.solar}CC`} />
                            <stop offset="100%" stopColor={`${colorScheme.solar}99`} />
                          </linearGradient>
                          <linearGradient id="windGradient2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={`${colorScheme.wind}CC`} />
                            <stop offset="100%" stopColor={`${colorScheme.wind}99`} />
                          </linearGradient>
                          <linearGradient id="batteryGradient2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={`${colorScheme.battery}CC`} />
                            <stop offset="100%" stopColor={`${colorScheme.battery}99`} />
                          </linearGradient>
                        </defs>
                        <Pie
                data={[
                            { 
                              name: 'Solar', 
                              value: Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / energyData.length),
                              icon: <Sun size={16} style={{verticalAlign: 'middle', marginRight: '5px'}} />
                            },
                            { 
                              name: 'Wind', 
                              value: Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / energyData.length),
                              icon: <Wind size={16} style={{verticalAlign: 'middle', marginRight: '5px'}} />
                            },
                            { 
                              name: 'Battery', 
                              value: Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / energyData.length),
                              icon: <Battery size={16} style={{verticalAlign: 'middle', marginRight: '5px'}} />
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          animationDuration={1000}
                          animationBegin={200}
                          label={({name, value, percent}) => {
                            return `${(percent * 100).toFixed(0)}%`;
                          }}
                          labelLine={false}
                          isAnimationActive={true}
                          filter="url(#shadow)"
                        >
                          <Cell key="solar" fill="url(#solarGradient2)" stroke={colorScheme.solar} strokeWidth={1.5} style={{filter: 'drop-shadow(0px 0px 6px rgba(255, 184, 0, 0.3))'}} />
                          <Cell key="wind" fill="url(#windGradient2)" stroke={colorScheme.wind} strokeWidth={1.5} style={{filter: 'drop-shadow(0px 0px 6px rgba(0, 136, 255, 0.3))'}} />
                          <Cell key="battery" fill="url(#batteryGradient2)" stroke={colorScheme.battery} strokeWidth={1.5} style={{filter: 'drop-shadow(0px 0px 6px rgba(0, 208, 132, 0.3))'}} />
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [value, 'Power Output']}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            padding: '8px 12px',
                            backdropFilter: 'blur(8px)'
                          }}
                          itemStyle={{
                            color: 'rgba(255, 255, 255, 0.8)'
                          }}
                          labelStyle={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 'bold',
                            marginBottom: '4px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          align="center"
                          layout="horizontal"
                          iconType="circle"
                          iconSize={10}
                          wrapperStyle={{
                            paddingTop: '10px'
                          }}
                          payload={[
                            { 
                              value: 'Solar', 
                              type: 'circle', 
                              color: colorScheme.solar,
                              id: 'solar'
                            },
                            { 
                              value: 'Wind', 
                              type: 'circle', 
                              color: colorScheme.wind,
                              id: 'wind'
                            },
                            { 
                              value: 'Battery', 
                              type: 'circle', 
                              color: colorScheme.battery,
                              id: 'battery'
                            }
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{zIndex: 1}}>
                      <div className="flex flex-col items-center bg-base-200/60 rounded-full w-20 h-20 justify-center shadow-inner" style={{
                        backdropFilter: 'blur(3px)',
                        position: 'absolute',
                        top: '30%',
                        left: '36%',
                        transform: 'translate(-50%, -50%)'
                      }}>
                        <Zap className="w-6 h-6 text-primary mb-1" />
                        <span className="text-xs font-medium text-center">Total Output</span>
                        <span className="text-xl font-bold">
                          {Math.round(energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) / energyData.length)}kW
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Energy source indicators with stats and trends */}
                  <div className="grid grid-cols-3 gap-2 mt-6 w-full">
                    <div className="flex flex-col p-3 rounded-lg" style={{
                      background: `linear-gradient(135deg, ${colorScheme.solar}11, ${colorScheme.solar}22)`,
                      borderLeft: `3px solid ${colorScheme.solar}`
                    }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="w-5 h-5" style={{color: colorScheme.solar}} />
                        <span className="text-sm font-semibold">Solar</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold" style={{color: colorScheme.solar}}>
                          {Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / energyData.length)}kW
                        </span>
                        <div className="flex items-center text-xs">
                          <span>{Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%</span>
                          <TrendingUp className="w-3 h-3 ml-1 text-success" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col p-3 rounded-lg" style={{
                      background: `linear-gradient(135deg, ${colorScheme.wind}11, ${colorScheme.wind}22)`,
                      borderLeft: `3px solid ${colorScheme.wind}`
                    }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Wind className="w-5 h-5" style={{color: colorScheme.wind}} />
                        <span className="text-sm font-semibold">Wind</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold" style={{color: colorScheme.wind}}>
                          {Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / energyData.length)}kW
                        </span>
                        <div className="flex items-center text-xs">
                          <span>{Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%</span>
                          <TrendingUp className="w-3 h-3 ml-1 text-success" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col p-3 rounded-lg" style={{
                      background: `linear-gradient(135deg, ${colorScheme.battery}11, ${colorScheme.battery}22)`,
                      borderLeft: `3px solid ${colorScheme.battery}`
                    }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Battery className="w-5 h-5" style={{color: colorScheme.battery}} />
                        <span className="text-sm font-semibold">Battery</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold" style={{color: colorScheme.battery}}>
                          {Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / energyData.length)}kW
                        </span>
                        <div className="flex items-center text-xs">
                          <span>{Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%</span>
                          <TrendingUp className="w-3 h-3 ml-1 text-success" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        <Sun className="w-4 h-4 mr-2" style={{color: colorScheme.solar}} /> 
                        Solar Power
                      </span>
                      <span style={{color: colorScheme.solar}} className="font-bold">
                        {Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / energyData.length)}kW
                      </span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%`,
                          background: `linear-gradient(to right, ${colorScheme.solar}99, ${colorScheme.solar})`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 flex justify-between">
                      <span>Contribution</span>
                      <span>{Math.round(energyData.reduce((sum, item) => sum + item.solar, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        <Wind className="w-4 h-4 mr-2" style={{color: colorScheme.wind}} /> 
                        Wind Power
                      </span>
                      <span style={{color: colorScheme.wind}} className="font-bold">
                        {Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / energyData.length)}kW
                      </span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%`,
                          background: `linear-gradient(to right, ${colorScheme.wind}99, ${colorScheme.wind})`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 flex justify-between">
                      <span>Contribution</span>
                      <span>{Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        <Battery className="w-4 h-4 mr-2" style={{color: colorScheme.battery}} /> 
                        Battery Power
                      </span>
                      <span style={{color: colorScheme.battery}} className="font-bold">
                        {Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / energyData.length)}kW
                      </span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%`,
                          background: `linear-gradient(to right, ${colorScheme.battery}99, ${colorScheme.battery})`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 flex justify-between">
                      <span>Contribution</span>
                      <span>{Math.round(energyData.reduce((sum, item) => sum + item.battery, 0) / 
                          energyData.reduce((sum, item) => sum + item.solar + item.wind + item.battery, 0) * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-base-300/50 rounded-lg border-l-4 border-secondary">
                    <h4 className="text-sm font-semibold mb-2">Distribution Summary</h4>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: colorScheme.solar}}></span>
                        Solar peaks at {energyData.reduce((highest, item) => Math.max(highest, item.solar), 0)}kW (midday)
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: colorScheme.wind}}></span>
                        Wind produces {Math.round(energyData.reduce((sum, item) => sum + item.wind, 0) / 24)}kW avg daily
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: colorScheme.battery}}></span>
                        Battery provides 22% of peak demand
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <RecommendationsCard />

        {/* Alerts */}
        <AlertsCard />

        {/* Enhanced Energy Forecast */}
        <div className="card bg-base-200/80 shadow-xl overflow-hidden border border-primary/10">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                Energy Forecast & Planning
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-10 bg-primary rounded-full"></span>
                  24-Hour Consumption Forecast
                </h3>
                
                {/* Custom chart implementation with explicit colors */}
                <div className="h-64 relative" ref={barChartRef}>
                  <div className="w-full h-full p-4 overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="consumptionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={`${colorScheme.consumption}`} />
                          <stop offset="100%" stopColor={`${colorScheme.consumption}88`} />
                        </linearGradient>
                        <linearGradient id="optimizedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={`${colorScheme.optimized}`} />
                          <stop offset="100%" stopColor={`${colorScheme.optimized}88`} />
                        </linearGradient>
                        <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2" />
                        </filter>
                      </defs>
                      
                      {/* X Axis */}
                      <line x1="50" y1="350" x2="950" y2="350" stroke="#888" strokeWidth="1"/>
                      
                      {/* Y Axis */}
                      <line x1="50" y1="50" x2="50" y2="350" stroke="#888" strokeWidth="1"/>
                      
                      {/* Render actual data points */}
                      <g className="consumption-bars">
                        {energyData.map((item, index) => {
                          const x = 50 + index * (900 / energyData.length);
                          const barWidth = 900 / energyData.length * 0.4;
                          const height = (item.consumption / 100) * 300;
                          return (
                            <rect 
                              key={`consumption-${index}`}
                              x={x} 
                              y={350 - height} 
                              width={barWidth} 
                              height={height}
                              fill="url(#consumptionGradient)"
                              stroke={colorScheme.consumption}
                              strokeWidth="1"
                              rx="2"
                              filter="url(#barShadow)"
                            />
                          );
                        })}
                      </g>
                      
                      <g className="optimized-bars">
                        {energyData.map((item, index) => {
                          const x = 50 + index * (900 / energyData.length) + (900 / energyData.length * 0.4) + 2;
                          const barWidth = 900 / energyData.length * 0.4;
                          const height = (item.optimizedUsage / 100) * 300;
                          return (
                            <rect 
                              key={`optimized-${index}`}
                              x={x} 
                              y={350 - height} 
                              width={barWidth} 
                              height={height}
                              fill="url(#optimizedGradient)"
                              stroke={colorScheme.optimized}
                              strokeWidth="1"
                              rx="2"
                              filter="url(#barShadow)"
                            />
                          );
                        })}
                      </g>
                      
                      {/* X Axis Labels */}
                      {energyData.filter((_, i) => i % 4 === 0).map((item, idx) => (
                        <text 
                          key={`xlabel-${idx}`}
                          x={50 + idx * 4 * (900 / energyData.length) + (900 / energyData.length / 2)}
                          y="370" 
                          textAnchor="middle"
                          fill="#888"
                          fontSize="12"
                        >
                          {item.time}
                        </text>
                      ))}
                      
                      {/* Y Axis Labels */}
                      {[0, 25, 50, 75, 100].map((value, idx) => (
                        <text 
                          key={`ylabel-${idx}`}
                          x="40" 
                          y={350 - (value / 100) * 300}
                          textAnchor="end"
                          fill="#888"
                          fontSize="12"
                          dominantBaseline="middle"
                        >
                          {value}kW
                        </text>
                      ))}
                      
                      {/* Legend */}
                      <rect x="750" y="50" width="15" height="15" fill="url(#consumptionGradient)" stroke={colorScheme.consumption} />
                      <text x="775" y="62" fill="#888" fontSize="12" dominantBaseline="middle">Predicted</text>
                      
                      <rect x="750" y="75" width="15" height="15" fill="url(#optimizedGradient)" stroke={colorScheme.optimized} />
                      <text x="775" y="87" fill="#888" fontSize="12" dominantBaseline="middle">Optimized</text>
                    </svg>
                  </div>
                </div>
                
                <div className="flex justify-center items-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.consumption}}></div>
                    <span className="text-xs">Predicted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: colorScheme.optimized}}></div>
                    <span className="text-xs">Optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Savings:</span>
                    <span className="text-xs font-bold" style={{color: colorScheme.battery}}>
                      {Math.round((energyData.reduce((sum, item) => sum + item.consumption, 0) - 
                      energyData.reduce((sum, item) => sum + item.optimizedUsage, 0)) / 
                      energyData.length)}kW avg
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <div className="text-sm font-medium mb-2">Forecast Analysis</div>
                  <p className="text-xs">
                    Our AI predicts consumption peaks at {Math.max(...energyData.map(d => d.consumption))}kW during 
                    peak hours. Implementing smart optimization can reduce this by up to 20%, resulting in significant 
                    cost savings and reduced grid load.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-10 bg-secondary rounded-full"></span>
                  Optimization Opportunities
                </h3>
                
                {[
                  {
                    time: 'Peak Hours (10 AM - 2 PM)',
                    action: 'Maximize solar collection, store excess in batteries',
                    impact: '+25% efficiency',
                    icon: Sun,
                    color: 'text-yellow-500',
                    barColor: colorScheme.solar,
                    textColor: 'text-yellow-600 dark:text-yellow-400'
                  },
                  {
                    time: 'Evening Transition (4 PM - 8 PM)',
                    action: 'Switch to wind power, conserve battery reserves',
                    impact: '+18% uptime',
                    icon: Wind,
                    color: 'text-blue-500',
                    barColor: colorScheme.wind,
                    textColor: 'text-blue-600 dark:text-blue-400'
                  },
                  {
                    time: 'Night Operations (9 PM - 5 AM)',
                    action: 'Rely on battery, slow charging at low rates',
                    impact: '+15% discharge',
                    icon: Battery,
                    color: 'text-green-500',
                    barColor: colorScheme.battery,
                    textColor: 'text-green-600 dark:text-green-400'
                  }
                ].map((opportunity, index) => (
                  <motion.div
                    key={index}
                    className="card overflow-hidden backdrop-blur-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute inset-0" style={{
                      background: `linear-gradient(to right, ${opportunity.barColor}33, ${opportunity.barColor}22)`
                    }}></div>
                    <div className="card-body p-4 relative">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-medium flex items-center gap-2 ${opportunity.textColor}`}>
                          <opportunity.icon className="w-4 h-4" />
                          {opportunity.time}
                        </h4>
                        <span className="badge text-white" style={{
                          background: `linear-gradient(to right, ${colorScheme.optimized}, ${colorScheme.predicted})`
                        }}>
                          {opportunity.impact}
                        </span>
                      </div>
                      <p className="text-base-content/70 text-sm mt-2">{opportunity.action}</p>
                      
                      <div className="flex justify-between text-xs mt-4">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" style={{color: colorScheme.optimized}} />
                          <span>Peak Reduction</span>
                        </div>
                        <div className="font-medium" style={{color: colorScheme.optimized}}>
                          {index === 0 ? '32 kW' : index === 1 ? '25 kW' : '18 kW'}
                        </div>
                      </div>
                      
                      <div className="w-full bg-base-300 h-1.5 mt-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{
                            width: index === 0 ? '75%' : index === 1 ? '60%' : '45%',
                            background: `linear-gradient(to right, ${colorScheme.optimized}88, ${colorScheme.optimized})`
                          }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="card p-4 mt-2 relative overflow-hidden bg-primary/5">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
                  <h4 className="text-sm font-medium flex items-center gap-2 relative">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Long-term Savings Projection
                  </h4>
                  
                  <div className="mt-3 h-20 relative">
                    <div className="absolute inset-0 flex items-end">
                      {(new Array(10).fill(0)).map((_, i) => {
                        const hue = Math.floor(Math.random() * 30 + 20);
                        const saturation = Math.floor(Math.random() * 20 + 80);
                        const lightness = Math.floor(Math.random() * 15 + 45);
                        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                        const alphaColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.2)`;
                        
                        return (
                          <div 
                            key={i}
                            className="flex-1 mx-px rounded-t-md"
                            style={{ 
                              height: `${20 + Math.sin(i/3) * 10 + Math.random() * 20}%`,
                              background: `linear-gradient(to bottom, ${color}, ${alphaColor})`,
                              boxShadow: '0 0 3px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                            }}
                          ></div>
                        );
                      })}
                    </div>
                    
                    <div className="absolute inset-0 flex items-end" style={{zIndex: 2}}>
                      {(new Array(10).fill(0)).map((_, i) => {
                        const hue = Math.floor(Math.random() * 30 + 190);
                        const saturation = Math.floor(Math.random() * 20 + 75);
                        const lightness = Math.floor(Math.random() * 15 + 40);
                        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                        const alphaColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.2)`;
                        
                        return (
                          <div 
                            key={i}
                            className="flex-1 mx-px rounded-t-md"
                            style={{ 
                              height: `${15 + Math.sin(i/3) * 8 + Math.random() * 10}%`,
                              background: `linear-gradient(to bottom, ${color}, ${alphaColor})`,
                              boxShadow: '0 0 3px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center gap-2 mt-4">
                    <div className="text-xs flex flex-col">
                      <span className="opacity-70">Monthly Savings</span>
                      <span className="text-base font-bold text-emerald-500">₹10,275</span>
                    </div>
                    <div className="text-xs flex flex-col">
                      <span className="opacity-70">Yearly Impact</span>
                      <span className="text-base font-bold text-emerald-500">₹123,300</span>
                    </div>
                    <div className="text-xs flex flex-col">
                      <span className="opacity-70">CO₂ Reduction</span>
                      <span className="text-base font-bold text-emerald-500">28.4 tons</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn btn-primary btn-lg gap-2"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Detailed Analysis Report
              </>
            )}
          </button>
        </div>
      </motion.div>
      
      {/* Add global styles for Recharts elements */}
      <style>{`
        .recharts-surface {
          transition: all 0.3s ease;
          margin: 0 auto;
        }
        
        .recharts-layer.recharts-area-dots,
        .recharts-layer.recharts-bar-rectangles {
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.15));
        }
        
        .recharts-curve.recharts-area-area {
          filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.2));
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }
        
        .recharts-curve.recharts-area-area:hover {
          opacity: 0.9;
        }
        
        /* Solar area styling */
        .recharts-curve.recharts-area-area.solar-area {
          fill: url(#solarGradient) !important;
          filter: drop-shadow(0 4px 6px rgba(255, 184, 0, 0.3));
        }
        
        /* Wind area styling */
        .recharts-curve.recharts-area-area.wind-area {
          fill: url(#windGradient) !important;
          filter: drop-shadow(0 4px 6px rgba(0, 136, 255, 0.3));
        }
        
        /* Battery area styling */
        .recharts-curve.recharts-area-area.battery-area {
          fill: url(#batteryGradient) !important;
          filter: drop-shadow(0 4px 6px rgba(0, 208, 132, 0.3));
        }
        
        /* Enhanced path styling */
        .recharts-curve.solar-stroke {
          stroke: ${colorScheme.solar} !important;
          stroke-width: 3px !important;
          filter: drop-shadow(0 2px 4px rgba(255, 184, 0, 0.5));
        }
        
        .recharts-curve.wind-stroke {
          stroke: ${colorScheme.wind} !important;
          stroke-width: 3px !important;
          filter: drop-shadow(0 2px 4px rgba(0, 136, 255, 0.5));
        }
        
        .recharts-curve.battery-stroke {
          stroke: ${colorScheme.battery} !important;
          stroke-width: 3px !important;
          filter: drop-shadow(0 2px 4px rgba(0, 208, 132, 0.5));
        }
        
        /* Add chart animations */
        .recharts-layer {
          transition: transform 0.3s ease;
        }
        
        .recharts-layer:hover {
          transform: translateY(-2px);
        }
        
        .recharts-tooltip-wrapper {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
          transition: all 0.2s ease;
        }
        
        .recharts-default-tooltip {
          background-color: rgba(17, 24, 39, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
          backdrop-filter: blur(8px) !important;
        }
        
        /* Enhance the axis and grid */
        .recharts-cartesian-axis-line {
          stroke: rgba(255, 255, 255, 0.1) !important;
        }
        
        .recharts-cartesian-axis-tick-line {
          stroke: rgba(255, 255, 255, 0.1) !important;
        }
        
        .recharts-cartesian-axis-tick-value {
          fill: rgba(255, 255, 255, 0.5) !important;
          font-size: 11px !important;
        }
        
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: rgba(255, 255, 255, 0.05) !important;
          stroke-dasharray: 2 4 !important;
        }
        
        /* Add glow effects to chart elements */
        @keyframes glow {
          0% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3)); }
          50% { filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5)); }
          100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3)); }
        }
        
        .recharts-active-dot {
          animation: glow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default RenewableEnergy;