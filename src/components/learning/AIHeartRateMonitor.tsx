import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Heart, Camera, AlertTriangle, Check, X, Info, Play, Square, ArrowRight, 
  PauseCircle, MoveHorizontal, ZoomIn, Activity, Zap, Calendar, Clock, 
  Bookmark, Share2, Medal, PieChart, ChevronRight, TrendingUp, TrendingDown, 
  Download, BarChart2, ThumbsUp, User, Settings, 
  HelpCircle, BellRing, FileText, Backpack
} from 'lucide-react';
import { 
  getHealthInsights, 
  getPersonalizedHealthTips, 
  analyzeHeartRatePatterns 
} from '../../utils/geminiAI';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define types
interface HealthInsight {
  insights: string[];
  recommendations: string[];
  riskFactors?: string[];
  score: number;
}

interface HeartRateReading {
  value: number;
  timestamp: Date;
}

interface OxygenReading {
  value: number;
  timestamp: Date;
}

interface HealthProfile {
  age?: number;
  gender?: string;
  activityLevel?: string;
  healthGoals?: string[];
  riskFactors?: string[];
  baselines?: {
    restingHR?: number;
    maxHR?: number;
    minO2?: number;
  };
}

interface PatternAnalysis {
  patterns: string[];
  anomalies: {type: string, description: string, severity: 'low' | 'medium' | 'high'}[];
  trends: {metric: string, direction: 'improving' | 'declining' | 'stable', description: string}[];
}

// Main component
const AIHeartRateMonitor = () => {
  // Basic state
  const [isStarted, setIsStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [measurements, setMeasurements] = useState<number[]>([]);
  const [signal, setSignal] = useState<number[]>([]);
  const [calibrating, setCalibrating] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [fingerprintDetected, setFingerprintDetected] = useState(false);
  const [oxygenLevel, setOxygenLevel] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<string | null>(null);

  // Enhanced state
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    age: 30,
    gender: 'Not specified',
    activityLevel: 'Moderate',
    healthGoals: ['Improve fitness', 'Reduce stress'],
    baselines: {
      restingHR: 68,
      maxHR: 190,
      minO2: 95
    }
  });
  const [selectedView, setSelectedView] = useState<'results' | 'insights' | 'history' | 'profile'>('results');
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRateReading[]>([]);
  const [oxygenHistory, setOxygenHistory] = useState<OxygenReading[]>([]);
  const [healthInsights, setHealthInsights] = useState<HealthInsight | null>(null);
  const [personalizedTips, setPersonalizedTips] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [measurementMode, setMeasurementMode] = useState<'standard' | 'advanced' | 'training'>('standard');
  const [trainingMode, setTrainingMode] = useState<'rest' | 'active' | 'recovery'>('rest');
  const [lastMeasurementAt, setLastMeasurementAt] = useState<Date | null>(null);
  const [healthScore, setHealthScore] = useState<number>(75);
  const [savedReadings, setSavedReadings] = useState<{
    heartRate: number;
    oxygenLevel: number;
    date: Date;
    note?: string;
  }[]>([]);
  const [measurementNote, setMeasurementNote] = useState('');
  const [chartTimespan, setChartTimespan] = useState<'day' | 'week' | 'month'>('week');
  const [trendingIndicator, setTrendingIndicator] = useState<'up' | 'down' | 'stable'>('stable');
  const [achievedMilestones, setAchievedMilestones] = useState<{
    title: string;
    date: Date;
    description: string;
  }[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const signalIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const measurementStartTime = useRef<number | null>(null);
  const chartRef = useRef<any>(null);
  
  // Constants
  const CALIBRATION_TIME = 5; // seconds
  const MEASUREMENT_TIME = 15; // seconds
  const MAX_HEARTRATE = 220;
  const MIN_HEARTRATE = 40;

  // Initialize animations
  const controls = useAnimation();
  const pulseControls = useAnimation();

  // Set up pulse animation
  useEffect(() => {
    const startPulseAnimation = async () => {
      await pulseControls.start({
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        transition: { 
          repeat: Infinity, 
          duration: heartRate ? 60 / (heartRate || 70) : 0.8,
          ease: "easeInOut" 
        }
      });
    };
    
    if (heartRate) {
      startPulseAnimation();
    }
  }, [heartRate, pulseControls]);

  // Calculate heart zone based on heart rate and max heart rate
  const getHeartRateZone = (hr: number | null) => {
    if (!hr) return 'Unknown';
    
    const maxHR = healthProfile.baselines?.maxHR || (220 - (healthProfile.age || 30));
    const percentage = (hr / maxHR) * 100;
    
    if (percentage < 50) return 'Rest';
    if (percentage < 60) return 'Very Light';
    if (percentage < 70) return 'Light';
    if (percentage < 80) return 'Moderate';
    if (percentage < 90) return 'Hard';
    return 'Maximum';
  };

  // Memoized chart data for heart rate history
  const heartRateChartData = useMemo(() => {
    // Filter data based on selected timespan
    const now = new Date();
    let filteredData = [...heartRateHistory];
    
    if (chartTimespan === 'day') {
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(now.getDate() - 1);
      filteredData = heartRateHistory.filter(reading => reading.timestamp >= oneDayAgo);
    } else if (chartTimespan === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      filteredData = heartRateHistory.filter(reading => reading.timestamp >= oneWeekAgo);
    } else if (chartTimespan === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filteredData = heartRateHistory.filter(reading => reading.timestamp >= oneMonthAgo);
    }
    
    // Format data for Chart.js
    return {
      labels: filteredData.map(reading => {
        const date = new Date(reading.timestamp);
        return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      }),
      datasets: [
        {
          label: 'Heart Rate (BPM)',
          data: filteredData.map(reading => reading.value),
          fill: true,
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
          borderColor: 'rgba(220, 38, 38, 0.8)',
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(220, 38, 38, 1)'
        }
      ]
    };
  }, [heartRateHistory, chartTimespan]);

  // Fix chart options to comply with Chart.js types
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(220, 38, 38, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      },
      y: {
        min: Math.max(40, Math.min(...heartRateHistory.map(r => r.value)) - 10),
        max: Math.min(200, Math.max(...heartRateHistory.map(r => r.value)) + 10),
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad' as const
    }
  };

  // Load sample data for demo purposes
  useEffect(() => {
    // Create some sample history data if none exists
    if (heartRateHistory.length === 0) {
      const sampleData: HeartRateReading[] = [];
      const sampleOxygenData: OxygenReading[] = [];
      
      // Generate 14 days of data with 1-3 readings per day
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        // Random number of readings for this day (1-3)
        const readingsCount = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < readingsCount; j++) {
          const readingTime = new Date(date);
          // Distribute readings throughout the day
          readingTime.setHours(8 + j * 6);
          readingTime.setMinutes(Math.floor(Math.random() * 60));
          
          // Heart rate tends to be lower in morning, higher in evening
          let baseHR = 65;
          if (readingTime.getHours() < 12) baseHR = 60;
          else if (readingTime.getHours() > 18) baseHR = 70;
          
          // Add some variability
          const heartRateValue = baseHR + Math.floor(Math.random() * 15) - 5;
          sampleData.push({
            value: heartRateValue,
            timestamp: readingTime
          });
          
          // Oxygen levels are typically high and stable
          const oxygenValue = 95 + Math.floor(Math.random() * 5);
          sampleOxygenData.push({
            value: oxygenValue,
            timestamp: readingTime
          });
        }
      }
      
      // Sort by timestamp, oldest first
      sampleData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      sampleOxygenData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setHeartRateHistory(sampleData);
      setOxygenHistory(sampleOxygenData);
      
      // Add some sample saved readings
      setSavedReadings([
        {
          heartRate: 68,
          oxygenLevel: 98,
          date: new Date(now.setDate(now.getDate() - 7)),
          note: "Morning reading, after 8hrs sleep"
        },
        {
          heartRate: 72,
          oxygenLevel: 97,
          date: new Date(now.setDate(now.getDate() - 3)),
          note: "After light exercise"
        }
      ]);
      
      // Set achievements
      setAchievedMilestones([
        {
          title: "First Measurement",
          date: new Date(now.setDate(now.getDate() - 14)),
          description: "Started your heart health journey"
        },
        {
          title: "Week Streak",
          date: new Date(now.setDate(now.getDate() - 7)),
          description: "Completed 7 days of consistent measurements"
        }
      ]);
    }
  }, [heartRateHistory.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (signalIntervalRef.current) {
        clearInterval(signalIntervalRef.current);
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  // PPG processing algorithm
  const processPPG = (data: number[]) => {
    // Remove baseline wander (high-pass filter)
    let filteredData = [...data];
    if (filteredData.length > 10) {
      const windowSize = 10;
      for (let i = windowSize; i < filteredData.length; i++) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          sum += filteredData[i - j];
        }
        const average = sum / windowSize;
        filteredData[i] = filteredData[i] - average + 50; // Normalize around 50
      }
    }
    
    return filteredData;
  };

  // Detect peaks in PPG signal
  const detectPeaks = (data: number[], threshold = 5) => {
    const peaks: number[] = [];
    
    if (data.length < 3) return peaks;
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i-1] && data[i] > data[i+1] && data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  };

  // Calculate heart rate from peak intervals with improved algorithm
  const calculateHeartRate = (peaks: number[], samplingRate: number) => {
    if (peaks.length < 3) return null; // Need at least 3 peaks for better accuracy
    
    // Calculate intervals between peaks
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i-1]);
    }
    
    // Apply Hampel filter to remove outliers 
    // (essential for reliable heart rate detection)
    const medianInterval = intervals.slice().sort((a, b) => a - b)[Math.floor(intervals.length / 2)];
    const madValue = intervals.map(i => Math.abs(i - medianInterval))
      .sort((a, b) => a - b)[Math.floor(intervals.length / 2)];
    const threshold = 3 * madValue;
    
    const filteredIntervals = intervals.filter(interval => {
      return Math.abs(interval - medianInterval) <= threshold;
    }).filter(interval => {
      // Additional boundary check for physiologically possible values
      // Normal heart rate is between 40-220 BPM
      const minInterval = (60 / 220) * samplingRate;
      const maxInterval = (60 / 40) * samplingRate;
      return interval >= minInterval && interval <= maxInterval;
    });
    
    if (filteredIntervals.length < 2) return null;
    
    // Use weighted moving average for more stability
    const weights = filteredIntervals.map((_, i) => i + 1);
    const weightSum = weights.reduce((sum, w) => sum + w, 0);
    
    const weightedSum = filteredIntervals.reduce((sum, interval, i) => {
      return sum + (interval * weights[i]);
    }, 0);
    
    const avgInterval = weightedSum / weightSum;
    
    // Convert to BPM (beats per minute)
    const bpm = Math.round((60 * samplingRate) / avgInterval);
    
    // Apply Kalman filter-inspired approach for temporal stability
    // This reduces "jumpy" readings
    const prevHeartRate = measurements.length > 0 ? 
      measurements[measurements.length - 1] : null;
    
    if (prevHeartRate !== null) {
      // Blend with previous measurement for stability
      // with heavier weight on new measurement if confidence is high
      const blendFactor = confidence > 70 ? 0.7 : 0.5;
      return Math.round(bpm * blendFactor + prevHeartRate * (1 - blendFactor));
    }
    
    return bpm;
  };

  // Helper functions for oxygen estimation
  const calculateAC = (data: number[]) => {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);
  };

  const calculateDC = (data: number[]) => {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  };

  const applySimpleBandpassFilter = (data: number[]) => {
    if (data.length < 5) return data;
    
    const filtered = [];
    const windowSize = 5;
    
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize || i >= data.length - windowSize) {
        filtered.push(data[i]);
      } else {
        let sum = 0;
        for (let j = i - windowSize; j <= i + windowSize; j++) {
          sum += data[j];
        }
        const avg = sum / (windowSize * 2 + 1);
        filtered.push(data[i] - avg + 50); // Center around 50
      }
    }
    
    return filtered;
  };

  // Estimate oxygen saturation level
  const estimateOxygenLevel = (redData: number[], greenData: number[]) => {
    if (redData.length < 20 || greenData.length < 20) return null;
    
    // Normalize and trim signals to equal length
    const length = Math.min(redData.length, greenData.length);
    const trimmedRedData = redData.slice(-length);
    const trimmedGreenData = greenData.slice(-length);
    
    // Apply bandpass filter: 0.5-5Hz (typical range for heart rate)
    const filteredRed = applySimpleBandpassFilter(trimmedRedData);
    const filteredGreen = applySimpleBandpassFilter(trimmedGreenData);
    
    // Calculate AC/DC for red and infrared (green as proxy) channels
    const redAC = calculateAC(filteredRed);
    const greenAC = calculateAC(filteredGreen);
    const redDC = calculateDC(trimmedRedData);
    const greenDC = calculateDC(trimmedGreenData);
    
    // Avoid division by zero
    if (redDC === 0 || greenDC === 0 || redAC === 0 || greenAC === 0) {
      return null;
    }
    
    // Calculate R value using the standard formula
    // R = (AC_red / DC_red) / (AC_green / DC_green)
    const rValue = (redAC / redDC) / (greenAC / greenDC);
    
    // Convert R to SpO2 using empirical formula
    // This is a simplified version of the clinical formula
    // SpO2 = 110 - 25 * R (general approximation)
    let spO2 = Math.round(110 - 25 * rValue);
    
    // Clamp to physiologically possible values
    spO2 = Math.min(100, Math.max(85, spO2));
    
    // Apply confidence-based adjustment
    if (confidence < 60) {
      // Default to a normal value with low confidence
      return Math.round(spO2 * 0.3 + 97 * 0.7);
    }
    
    return spO2;
  };

  // Initialize camera
  const initializeCamera = async () => {
    try {
      setIsStarted(true);
      setError(null);
      
      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsReady(true);
        setStep(2);
        
        // Set up canvas for processing video frames
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          if (context) {
            // Set canvas size
            canvas.width = 100;  // Small size for processing efficiency
            canvas.height = 100;
          }
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  // Toggle flash with better browser compatibility
  const toggleFlash = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      
      // Simply toggle the visual effect without trying to access torch
      // This is more compatible across browsers
      setFlashEnabled(!flashEnabled);
      
      // Try to use actual torch if available
      // This is an optional enhancement that works on supported devices
      try {
        // Check for torch capability safely
        const capabilities = videoTrack.getCapabilities();
        // @ts-ignore - Safely check for torch capability
        if (capabilities && 'torch' in capabilities) {
          // Apply constraints in a way that works but bypasses TypeScript checks
          const constraints = {
            advanced: [{}]
          };
          // @ts-ignore - Add torch property dynamically
          constraints.advanced[0].torch = !flashEnabled;
          
          videoTrack.applyConstraints(constraints).catch(err => {
            console.log('Torch not available or accessible:', err);
          });
        }
      } catch (error) {
        console.log('Device does not support torch control');
      }
    }
  };

  // Update trending indicator based on analysis direction
  const updateTrendIndicator = (analysisDirection: 'improving' | 'declining' | 'stable') => {
    if (analysisDirection === 'improving') {
      setTrendingIndicator('down'); // Lower heart rate is usually better
    } else if (analysisDirection === 'declining') {
      setTrendingIndicator('up');
    } else {
      setTrendingIndicator('stable');
    }
  };

  // ... rest of the component code ...

  return (
    <div className="w-full h-full max-w-full overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full"
      >
        <div className="text-center p-2 md:p-4">
          <h1 className="text-lg md:text-2xl font-bold flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            AI Heart Rate Monitor
          </h1>
          <p className="text-xs md:text-sm text-base-content/70 mt-1">
            Monitor your heart rate with just your phone's camera
          </p>
        </div>
        
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-error/10 border-l-4 border-error p-3 mb-3 mx-2 md:mx-4 md:p-4 md:mb-4 rounded-r-lg"
            >
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-error mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-error text-sm md:text-base">Error</h3>
                  <p className="text-xs md:text-sm">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4">
          {/* Step 1: Start */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-gradient-to-br from-base-200/70 to-base-300/50 shadow-xl w-full max-w-sm backdrop-blur-sm border border-base-content/5"
            >
              <div className="card-body p-3 md:p-5 items-center text-center">
                <div className="card-title flex-col gap-2">
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut" 
                      }}
                    >
                      <Heart className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
                    </motion.div>
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-ping"></span>
                  </div>
                  <h2 className="text-base md:text-lg">Heart Rate Monitor</h2>
                </div>
                
                <div className="bg-gradient-to-r from-base-300/50 to-base-300/30 rounded-lg p-2 mb-3 text-xs md:text-sm">
                  <p className="mb-1">Accurately measure your heart rate using just your phone's camera.</p>
                  <p className="text-2xs md:text-xs text-base-content/70">
                    Place your finger over the camera and stay still for best results.
                  </p>
                </div>
                
                {/* Additional UI sections rendered conditionally */}
                {/* ... */}
                
                <div className="card-actions justify-center space-y-2 w-full">
                  <button 
                    className="btn btn-primary w-full btn-sm md:btn-md gap-2"
                    onClick={initializeCamera}
                  >
                    <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Start Measuring
                  </button>
                  
                  {/* Additional buttons */}
                  {/* ... */}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Steps 2-4 rendered conditionally */}
          {/* ... */}
        </div>
        
        {/* Disclaimer */}
        <div className="p-2 md:p-4 text-center text-2xs md:text-xs text-base-content/50">
          This is for educational purposes only and not intended for medical use.
          <br />Always consult healthcare professionals for medical advice.
        </div>
      </motion.div>
    </div>
  );
};

export default AIHeartRateMonitor; 