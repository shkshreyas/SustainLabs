import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Heart, Camera, AlertTriangle, Check, X, Info, Play, Square, ArrowRight, 
  PauseCircle, MoveHorizontal, ZoomIn, Activity, Zap, Calendar, Clock, 
  Bookmark, Share2, Medal, PieChart, ChevronRight, TrendingUp, TrendingDown, 
  Download, BarChart2, ThumbsUp, User, Settings, Battery,
  HelpCircle, BellRing, FileText, Backpack, Mic, MicOff, Eye, EyeOff, RefreshCw, Maximize2, ActivitySquare, Share, ArrowLeft
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
// Comment out the problematic imports that cause reference errors
// import { FFT } from 'dsp.js';
import html2canvas from 'html2canvas';
// import DSP from 'dsp.js';

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

interface HealthTip {
  id: number;
  category: string;
  tip: string;
  source: string;
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
  const [loading, setLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [measurementProgress, setMeasurementProgress] = useState(0);
  
  // Variables for signal processing - moved to component scope
  const [processedSignal, setProcessedSignal] = useState<number[]>([]);
  const [redData, setRedData] = useState<number[]>([]);
  const [greenData, setGreenData] = useState<number[]>([]);
  const [blueData, setBlueData] = useState<number[]>([]);

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
  const [personalizedTips, setPersonalizedTips] = useState<HealthTip[]>([]);
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

  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [micStream, setMicStream] = useState<MediaStreamAudioSourceNode | null>(null);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [heartSoundDetected, setHeartSoundDetected] = useState(false);
  const [audioConfidence, setAudioConfidence] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const signalIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const measurementStartTime = useRef<number | null>(null);
  const chartRef = useRef<any>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<Uint8Array | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isWebGLSupported = useRef<boolean>(false);
  
  // Constants
  const CALIBRATION_TIME = 5; // seconds
  const MEASUREMENT_TIME = 15; // seconds
  const MAX_HEARTRATE = 220;
  const MIN_HEARTRATE = 40;

  // Initialize animations
  const controls = useAnimation();
  const pulseControls = useAnimation();

  // Add state to track screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Add effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Chart options with responsive adjustments for font sizes and spacing
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
            size: isMobile ? 8 : 10
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
          font: {
            size: isMobile ? 8 : 10
          },
          maxRotation: isMobile ? 45 : 0
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        min: 40,
        max: Math.min(200, Math.max(...heartRateHistory.map(r => r.value)) + 10),
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: isMobile ? 8 : 10
          }
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
      
      // Clean up audio
      cleanupAudio();
    };
  }, []);

  // Savitzky-Golay filter implementation
  const applySavitzkyGolayFilter = (data: number[], windowSize: number, polynomialOrder: number) => {
    // Simple implementation for real-time processing
    // In a full implementation, this would use matrix operations to fit polynomials
    
    // For now, use a simplified weighted moving average as an approximation
    const result = [];
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let weightSum = 0;
      
      for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
        // Distance-based weight (approximating polynomial fit)
        const distance = Math.abs(i - j);
        const weight = 1 / (1 + distance * distance);
        
        sum += data[j] * weight;
        weightSum += weight;
      }
      
      result.push(sum / weightSum);
    }
    
    return result;
  };

  // Remove baseline wander with a high-pass filter
  const removeBaselineWander = (data: number[]) => {
    const result = [...data];
    
    // Use a moving average to estimate the baseline
    const windowSize = Math.min(50, Math.floor(data.length / 4));
    if (windowSize < 3) return data;
    
    for (let i = windowSize; i < data.length - windowSize; i++) {
      let baselineSum = 0;
      
      // Calculate average of surrounding points (excluding current region)
      for (let j = i - windowSize; j < i - windowSize/3; j++) {
        baselineSum += data[j];
      }
      for (let j = i + windowSize/3; j < i + windowSize; j++) {
        baselineSum += data[j];
      }
      
      const baseline = baselineSum / (windowSize * 2 - windowSize/1.5);
      
      // Subtract baseline from signal
      result[i] = data[i] - baseline + 50; // Center around 50
    }
    
    return result;
  };

  // Normalize signal to a standardized range
  const normalizeSignal = (data: number[]) => {
    if (data.length === 0) return data;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    if (max === min) return data.map(() => 50);
    
    return data.map(val => ((val - min) / (max - min)) * 80 + 10); // Range 10-90
  };

  // Enhanced peak detection with adaptive thresholding
  const enhancedPeakDetection = (data: number[]) => {
    const peaks: number[] = [];
    if (data.length < 10) return peaks;
    
    // Calculate adaptive threshold based on signal statistics
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    // Adaptive threshold based on signal characteristics
    // Higher for noisy signals, lower for clean signals
    const noiseFactor = Math.min(1.0, stdDev / 20); // Estimate noise level
    const adaptiveThreshold = mean + (1.5 + noiseFactor) * stdDev;
    
    // Minimum distance between peaks based on physiological limits
    // Heart rate of 220 BPM = 3.67 Hz = minimum 8 samples at 30 fps
    const minPeakDistance = 8;
    
    // Find peaks with minimum height and distance constraints
    for (let i = 2; i < data.length - 2; i++) {
      if (data[i] > adaptiveThreshold && 
          data[i] > data[i-1] && 
          data[i] > data[i-2] &&
          data[i] > data[i+1] && 
          data[i] > data[i+2]) {
        
        // Check if we already found a peak nearby
        const tooClose = peaks.some(peakIndex => 
          Math.abs(i - peakIndex) < minPeakDistance
        );
        
        if (!tooClose) {
          // Fine-tune peak location with quadratic interpolation
          const refinedPeakIndex = refinePeakLocation(data, i);
          peaks.push(refinedPeakIndex);
        }
      }
    }
    
    return peaks;
  };

  // Refine peak location with parabolic interpolation
  const refinePeakLocation = (data: number[], peakIndex: number) => {
    if (peakIndex <= 0 || peakIndex >= data.length - 1) {
      return peakIndex;
    }
    
    const y1 = data[peakIndex - 1];
    const y2 = data[peakIndex];
    const y3 = data[peakIndex + 1];
    
    // Parabolic interpolation formula
    const offset = (y1 - y3) / (2 * (y1 - 2 * y2 + y3));
    
    // Only use refined position if it's reasonable
    if (Math.abs(offset) < 1) {
      return peakIndex + offset;
    }
    
    return peakIndex;
  };

  // Add advanced signal processing for better accuracy
  const applyAdvancedSignalProcessing = (data: number[]) => {
    if (data.length < 20) return data;
    
    // Step 1: Apply Savitzky-Golay filter for smoothing while preserving peaks
    const smoothedData = applySavitzkyGolayFilter(data, 5, 3);
    
    // Step 2: Apply baseline wander removal (high-pass filter)
    const baselineCorrected = removeBaselineWander(smoothedData);
    
    // Step 3: Normalize the signal
    const normalizedData = normalizeSignal(baselineCorrected);
    
    return normalizedData;
  };

  // Update the processPPG function to use enhanced processing
  const processPPG = (data: number[]) => {
    if (data.length <= 10) return data;
    
    // Apply the enhanced signal processing
    return applyAdvancedSignalProcessing(data);
  };

  // Add sensor fusion with Kalman filter for more robust heart rate estimation
  const kalmanFilterHeartRate = (newMeasurement: number, uncertainty: number) => {
    // Kalman filter state variables (static using closure)
    const state = {
      estimate: heartRate || 75, // Initial estimate
      errorCovariance: 100 // Initial uncertainty
    };
    
    // Process noise (how much we expect the heart rate to vary naturally)
    const processNoise = 1.0;
    
    // Measurement noise (based on confidence)
    const measurementNoise = 100 - uncertainty;
    
    // Prediction step
    const predictedEstimate = state.estimate;
    const predictedErrorCovariance = state.errorCovariance + processNoise;
    
    // Update step
    const kalmanGain = predictedErrorCovariance / (predictedErrorCovariance + measurementNoise);
    const updatedEstimate = predictedEstimate + kalmanGain * (newMeasurement - predictedEstimate);
    const updatedErrorCovariance = (1 - kalmanGain) * predictedErrorCovariance;
    
    // Update state
    state.estimate = updatedEstimate;
    state.errorCovariance = updatedErrorCovariance;
    
    return Math.round(state.estimate);
  };

  // Add a method to enhance oxygen level estimation with multi-wavelength analysis
  const enhancedOxygenEstimation = (redData: number[], greenData: number[], blueData: number[]) => {
    if (redData.length < 30 || greenData.length < 30 || blueData.length < 30) return null;
    
    // Normalize and filter all channels
    const processedRed = applyAdvancedSignalProcessing(redData.slice(-100));
    const processedGreen = applyAdvancedSignalProcessing(greenData.slice(-100));
    const processedBlue = applyAdvancedSignalProcessing(blueData.slice(-100));
    
    // Calculate pulsatility index for each channel
    const redPI = calculatePulsatilityIndex(processedRed);
    const greenPI = calculatePulsatilityIndex(processedGreen);
    const bluePI = calculatePulsatilityIndex(processedBlue);
    
    // Calculate ratio of ratios
    // For SpO2, we use the ratio between red and infrared (approximated by green)
    // Using more sophisticated analysis with all three channels
    const r1 = redPI / greenPI;
    const r2 = redPI / bluePI;
    
    // Empirical model (simplified)
    // In clinical pulse oximeters, this would be calibrated against real measurements
    const spO2Estimate1 = 110 - 25 * r1;
    const spO2Estimate2 = 104 - 17 * r2;
    
    // Weighted combination based on signal quality
    const redQuality = calculateSignalQuality(processedRed);
    const greenQuality = calculateSignalQuality(processedGreen);
    const blueQuality = calculateSignalQuality(processedBlue);
    
    const w1 = redQuality * greenQuality;
    const w2 = redQuality * blueQuality;
    const totalWeight = w1 + w2;
    
    // Calculate final SpO2 estimate
    let spO2 = 97; // Default value
    
    if (totalWeight > 0) {
      spO2 = Math.round((spO2Estimate1 * w1 + spO2Estimate2 * w2) / totalWeight);
      // Clamp to physiological range
      spO2 = Math.min(100, Math.max(85, spO2));
    }
    
    return spO2;
  };

  // Calculate pulsatility index
  const calculatePulsatilityIndex = (data: number[]) => {
    if (data.length < 5) return 0;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    // Avoid division by zero
    if (mean === 0) return 0;
    
    return (max - min) / mean;
  };

  // Calculate signal quality metric
  const calculateSignalQuality = (data: number[]) => {
    if (data.length < 20) return 0;
    
    // Calculate signal-to-noise ratio
    const peaks = enhancedPeakDetection(data);
    
    if (peaks.length < 2) return 0.2; // Low quality
    
    // Calculate regularity of peaks (more regular = higher quality)
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i-1]);
    }
    
    const meanInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const intervalVariance = intervals.reduce((sum, val) => sum + Math.pow(val - meanInterval, 2), 0) / intervals.length;
    const cv = Math.sqrt(intervalVariance) / meanInterval; // Coefficient of variation
    
    // Quality score based on coefficient of variation (lower CV = higher quality)
    const regularityScore = Math.max(0, Math.min(1, 1 - cv));
    
    // Consider amplitude of the signal relative to noise
    const signalStrength = (Math.max(...data) - Math.min(...data)) / 50;
    const amplitudeScore = Math.min(1, signalStrength);
    
    // Overall quality score (0 to 1)
    return 0.7 * regularityScore + 0.3 * amplitudeScore;
  };

  // Initialize camera when starting measurement
  const initializeCamera = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        }
      });
      
      setCameraStream(stream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      // Try to enable flash if available
      try {
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        // Use optional chaining for torch capability
        if (capabilities && capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: false } as any]
          });
        }
      } catch (e) {
        console.log('Flash not supported');
      }
      
      // Move to next step
      setStep(2);
      setLoading(false);
      setIsStarted(true);
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Please ensure camera permissions are granted and try again.');
      setLoading(false);
    }
  };

  // Initialize heart rate monitor
  const initializeHeartRateMonitor = () => {
    setIsStarted(true);
    initializeCamera();
  };

  // Start the measurement process
  const startMeasurement = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not initialized');
      return;
    }
    
    setIsMeasuring(true);
    setCalibrating(true);
    setTimeElapsed(0);
    setMeasurementProgress(0);
    
    // Reset data arrays
    setMeasurements([]);
    setSignal([]);
    setProcessedSignal([]);
    setRedData([]);
    setGreenData([]);
    setBlueData([]);
    
    measurementStartTime.current = Date.now();
    
    // Start processing frames
    intervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get pixel data
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const length = frame.data.length / 4;
      
      let r = 0, g = 0, b = 0;
      
      // Average pixel values (use center region for better results)
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const regionSize = Math.floor(Math.min(canvas.width, canvas.height) / 4);
      
      let pixelCount = 0;
      
      for (let y = centerY - regionSize; y < centerY + regionSize; y++) {
        for (let x = centerX - regionSize; x < centerX + regionSize; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          if (idx >= 0 && idx < frame.data.length - 3) {
            r += frame.data[idx];
            g += frame.data[idx + 1];
            b += frame.data[idx + 2];
            pixelCount++;
          }
        }
      }
      
      // Calculate averages
      r = r / pixelCount;
      g = g / pixelCount;
      b = b / pixelCount;
      
      // Store color data
      setRedData(prev => [...prev, r]);
      setGreenData(prev => [...prev, g]);
      setBlueData(prev => [...prev, b]);
      
      // Use green channel as primary signal (best for PPG)
      setSignal(prev => [...prev, g]);
      
      // Process the updated signal
      if (signal.length > 10) {
        const processed = processPPG([...signal]);
        setProcessedSignal(processed);
        
        // Detect peaks in the processed signal
        const peaks = enhancedPeakDetection(processed);
        
        // Calculate heart rate if we have enough peaks
        if (peaks.length >= 2) {
          // Calculate average interval between peaks
          const intervals = [];
          for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i-1]);
          }
          
          const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
          
          // Convert to heart rate: 
          // HR = 60 * sampling rate / average interval in samples
          // Assuming 30fps camera
          const samplingRate = 30; // frames per second
          const calculatedHR = Math.round(60 * samplingRate / avgInterval);
          
          // Validate the heart rate is physiologically plausible
          if (calculatedHR >= MIN_HEARTRATE && calculatedHR <= MAX_HEARTRATE) {
            // Apply Kalman filter for smoother readings
            const filteredHR = kalmanFilterHeartRate(calculatedHR, confidence);
            
            setMeasurements(prev => [...prev, filteredHR]);
            setHeartRate(filteredHR);
            
            // Estimate oxygen level
            const oxygenEstimate = enhancedOxygenEstimation(redData, greenData, blueData);
            if (oxygenEstimate !== null) {
              setOxygenLevel(oxygenEstimate);
            }
            
            // Set fingerprint detected flag based on signal quality
            const signalQuality = calculateSignalQuality(processed);
            setConfidence(signalQuality * 100);
            setFingerprintDetected(signalQuality > 0.5);
          }
        }
      }
      
      // Update time elapsed
      if (measurementStartTime.current) {
        const elapsed = (Date.now() - measurementStartTime.current) / 1000;
        setTimeElapsed(elapsed);
        
        // Calculate progress percentage
        const progress = (elapsed / MEASUREMENT_TIME) * 100;
        setMeasurementProgress(Math.min(100, progress));
        
        // Exit calibration after calibration time
        if (calibrating && elapsed >= CALIBRATION_TIME) {
          setCalibrating(false);
        }
        
        // Finish measurement after measurement time
        if (elapsed >= MEASUREMENT_TIME) {
          finishMeasurement();
        }
      }
    }, 1000 / 30); // 30 fps
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  };

  // Stop measurement early
  const stopMeasurement = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsMeasuring(false);
    setCalibrating(false);
    
    // Save the measurement if we have a valid heart rate
    if (heartRate && heartRate > 0) {
      saveReading();
    }
  };

  // Finish the measurement process
  const finishMeasurement = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsMeasuring(false);
    setCalibrating(false);
    
    // Calculate final heart rate as average of last few measurements
    if (measurements.length > 0) {
      const recentMeasurements = measurements.slice(-5);
      const averageHR = Math.round(recentMeasurements.reduce((sum, val) => sum + val, 0) / recentMeasurements.length);
      setHeartRate(averageHR);
      
      // Save the reading
      saveReading();
      
      // Move to results view
      setSelectedView('results');
      setStep(3);
    } else {
      setError('Could not detect a clear pulse. Please try again in better lighting conditions.');
      setStep(2);
    }
    
    // Fetch insights
    fetchInsights();
  };

  // Save the current reading
  const saveReading = () => {
    if (!heartRate) return;
    
    const now = new Date();
    
    // Add to history
    setHeartRateHistory(prev => [
      ...prev,
      {
        value: heartRate,
        timestamp: now
      }
    ]);
    
    if (oxygenLevel) {
      setOxygenHistory(prev => [
        ...prev,
        {
          value: oxygenLevel,
          timestamp: now
        }
      ]);
    }
    
    // Add to saved readings
    setSavedReadings(prev => [
      ...prev,
      {
        heartRate: heartRate,
        oxygenLevel: oxygenLevel || 95,
        date: now,
        note: measurementNote
      }
    ]);
    
    setLastMeasurementAt(now);
    setMeasurementNote('');
  };

  // Fetch insights from AI
  const fetchInsights = async () => {
    if (!heartRate) return;
    
    setIsLoadingInsights(true);
    
    try {
      // Get health insights
      const insights = await getHealthInsights(
        heartRate, 
        oxygenLevel || 97, 
        healthProfile, 
        heartRateHistory.map(hr => hr.value)
      );
      
      setHealthInsights(insights);
      setHealthScore(insights.score);
      
      // Get personalized tips
      const tips = await getPersonalizedHealthTips(
        heartRate,
        oxygenLevel || 97,
        healthProfile
      );
      
      setPersonalizedTips(tips);
      
      // Analyze patterns
      if (heartRateHistory.length > 5) {
        const analysis = await analyzeHeartRatePatterns(
          heartRateHistory.map(hr => hr.value),
          healthProfile
        );
        
        setPatternAnalysis(analysis);
        
        // Update trending indicator based on analysis
        const heartRateTrend = analysis.trends.find(t => t.metric === 'Heart Rate');
        if (heartRateTrend) {
          setTrendingIndicator(heartRateTrend.direction as 'up' | 'down' | 'stable');
        }
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Initialize audio processing
  const cleanupAudio = () => {
    if (micStream) {
      micStream.disconnect();
      setMicStream(null);
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      setAudioContext(null);
    }
  };

  // Function to handle torch/flashlight
  const toggleFlash = async () => {
    if (!videoRef.current || !cameraStream) return;
    
    try {
      const track = cameraStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      // Check if torch is supported using optional chaining
      if (capabilities && capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
      } else {
        setError("Flash not supported on this device");
      }
    } catch (err) {
      console.error("Error toggling flash:", err);
      setError("Failed to toggle flash");
    }
  };

  return (
    <div className={`relative flex ${isMobile ? 'flex-col' : 'flex-row'} w-full h-full bg-gray-900 text-white overflow-hidden rounded-lg shadow-2xl`}>
      {/* Left Panel - Camera/Results View */}
      <div className={`${isMobile ? 'w-full' : 'w-3/5'} h-full flex flex-col p-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} text-red-500 flex items-center`}>
            <Heart className="mr-2" size={isMobile ? 20 : 24} />
            AI Heart Rate Monitor
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={`flex items-center ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} bg-gray-800 hover:bg-gray-700 rounded-md`}
            >
              <Settings size={isMobile ? 14 : 16} className="mr-1" />
              {!isMobile && "Settings"}
            </button>
            
            {batteryLevel !== null && (
              <div className="flex items-center text-xs">
                <Heart className={`${batteryLevel > 20 ? 'text-green-500' : 'text-red-500'} ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>{batteryLevel}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Display area for video/results */}
        <div className={`relative flex-grow flex flex-col ${isStarted ? 'justify-start' : 'justify-center'} items-center overflow-hidden bg-gray-800 rounded-lg`}>
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-4 right-4 bg-red-500/10 border-l-4 border-red-500 p-2 md:p-4 rounded-r-lg z-10"
              >
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-500 text-sm md:text-base">Error</h3>
                    <p className="text-xs md:text-sm">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto p-1 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Start */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut" 
                }}
                className="mb-4"
              >
                <Heart size={isMobile ? 48 : 64} className="text-red-500" />
              </motion.div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Heart Rate Monitor</h3>
              <p className="text-sm md:text-base text-gray-300 mb-4">
                Measure your heart rate using your device's camera
              </p>
              <div className="bg-gray-700 rounded-lg p-3 mb-4 text-xs md:text-sm max-w-md">
                <p>Place your finger over the back camera and ensure it covers both the lens and flash.</p>
              </div>
            </div>
          )}

          {/* Step 2: Position Finger */}
          {step === 2 && (
            <div className="w-full h-full flex flex-col">
              <div className="relative w-full flex-grow bg-black">
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline 
                  muted
                />
                <canvas 
                  ref={canvasRef} 
                  className="absolute inset-0 w-full h-full opacity-0"
                />
                
                {!isMeasuring && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-white/60 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2,
                          ease: "easeInOut" 
                        }}
                        className="w-20 h-20 md:w-28 md:h-28 bg-red-500/20 backdrop-blur-sm rounded-full"
                      />
                    </div>
                  </div>
                )}
                
                {fingerprintDetected && !isMeasuring && (
                  <div className="absolute bottom-4 left-4 right-4 bg-green-500/20 backdrop-blur-sm rounded-lg p-2 flex items-center">
                    <Check className="text-green-500 mr-2" size={16} />
                    <span className="text-sm">Finger detected! Ready to measure.</span>
                  </div>
                )}
              </div>
              
              {!isMeasuring && (
                <div className="flex justify-between p-3 bg-gray-800">
                  <button 
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center"
                    onClick={() => {
                      if (cameraStream) {
                        cameraStream.getTracks().forEach(track => track.stop());
                        setCameraStream(null);
                      }
                      setStep(1);
                    }}
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                  </button>
                  
                  <button
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center"
                    onClick={() => startMeasurement()}
                  >
                    Start 
                    <Play size={16} className="ml-1" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && heartRate && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <div className="mb-4 relative">
                <motion.div
                  animate={pulseControls}
                  className="w-24 h-24 md:w-32 md:h-32 bg-red-500/20 rounded-full flex items-center justify-center"
                >
                  <Heart size={48} className="text-red-500" />
                </motion.div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-1">{heartRate}</h2>
              <p className="text-sm text-gray-400 mb-4">Beats Per Minute</p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Oxygen</p>
                  <p className="text-xl font-bold">{oxygenLevel || '95'}%</p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Zone</p>
                  <p className="text-xl font-bold">{getHeartRateZone(heartRate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-2 text-center text-xs text-gray-500">
            This is for educational purposes only and not intended for medical use.
            <br />Always consult healthcare professionals for medical advice.
          </div>
        </div>

        {/* Bottom controls area */}
        <div className="mt-4">
          {!isStarted ? (
            <button
              onClick={initializeHeartRateMonitor}
              disabled={isMeasuring}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-300"
            >
              <Heart size={20} className="animate-pulse" />
              <span>Start Heart Rate Monitor</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                    setCameraStream(null);
                  }
                  setIsStarted(false);
                  setStep(1);
                }}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Reset
              </button>
              
              {flashEnabled !== null && step === 2 && (
                <button
                  onClick={toggleFlash}
                  className={`py-2 px-4 ${flashEnabled ? 'bg-yellow-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-lg`}
                >
                  {flashEnabled ? 'Disable Flash' : 'Enable Flash'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Insights/History/Profile */}
      <div className={`${isMobile ? 'w-full mt-4' : 'w-2/5'} h-full bg-gray-800 rounded-lg p-4 flex flex-col overflow-hidden`}>
        {/* Tabs for the right panel */}
        <div className="flex mb-4 border-b border-gray-700">
          {['results', 'insights', 'history', 'profile'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view as any)}
              className={`${selectedView === view ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'} px-3 py-2 capitalize font-medium transition-colors`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Content for selected view */}
        <div className="flex-grow overflow-y-auto">
          {selectedView === 'results' && (
            <div className="p-4">
              <h3 className="text-lg font-bold mb-3">Latest Results</h3>
              
              {heartRate ? (
                <>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Heart Rate</span>
                      <span className="text-xl font-bold">{heartRate} BPM</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Oxygen Level</span>
                      <span className="text-xl font-bold">{oxygenLevel || '95'}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Zone</span>
                      <span className="text-xl font-bold">{getHeartRateZone(heartRate)}</span>
                    </div>
                  </div>
                  
                  {lastMeasurementAt && (
                    <div className="text-xs text-gray-400 mb-4">
                      Last measured: {lastMeasurementAt.toLocaleString()}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p>No measurements yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Complete a measurement to see results.</p>
                </div>
              )}
            </div>
          )}
          
          {selectedView === 'insights' && (
            <div className="p-4">
              <h3 className="text-lg font-bold mb-3">Health Insights</h3>
              
              {isLoadingInsights ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
                </div>
              ) : healthInsights ? (
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-300">Health Score</span>
                      <span className="text-xl font-bold">{healthInsights.score}/100</span>
                    </div>
                    
                    <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
                      <div 
                        className={`h-full rounded-full ${
                          healthInsights.score > 80 ? 'bg-green-500' : 
                          healthInsights.score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${healthInsights.score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-sm uppercase text-gray-400 mb-2">Insights</h4>
                  <ul className="space-y-2 mb-4">
                    {healthInsights.insights.map((insight, index) => (
                      <li key={index} className="bg-gray-700 p-3 rounded-lg text-sm">
                        {insight}
                      </li>
                    ))}
                  </ul>
                  
                  <h4 className="font-bold text-sm uppercase text-gray-400 mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {healthInsights.recommendations.map((rec, index) => (
                      <li key={index} className="bg-gray-700 p-3 rounded-lg text-sm flex items-start">
                        <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p>No insights available yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Complete a measurement to get insights.</p>
                </div>
              )}
            </div>
          )}
          
          {selectedView === 'history' && (
            <div className="p-4">
              <h3 className="text-lg font-bold mb-3">Measurement History</h3>
              
              <div className="flex mb-4 space-x-2">
                {['day', 'week', 'month'].map((span) => (
                  <button
                    key={span}
                    onClick={() => setChartTimespan(span as any)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      chartTimespan === span ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {span.charAt(0).toUpperCase() + span.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-4 h-56">
                {heartRateHistory.length > 0 ? (
                  <Line
                    data={heartRateChartData}
                    options={chartOptions}
                    ref={chartRef}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No history data available</p>
                  </div>
                )}
              </div>
              
              <h4 className="font-bold text-sm uppercase text-gray-400 mb-2">Recent Readings</h4>
              <div className="space-y-2">
                {savedReadings.slice(-3).reverse().map((reading, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold">{reading.heartRate} BPM</span>
                      <span className="text-xs text-gray-400">{reading.date.toLocaleString()}</span>
                    </div>
                    {reading.note && (
                      <p className="text-xs text-gray-300 mt-1">{reading.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedView === 'profile' && (
            <div className="p-4">
              <h3 className="text-lg font-bold mb-3">Health Profile</h3>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Age</p>
                    <p className="font-bold">{healthProfile.age} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Gender</p>
                    <p className="font-bold">{healthProfile.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Activity Level</p>
                    <p className="font-bold">{healthProfile.activityLevel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Resting Heart Rate</p>
                    <p className="font-bold">{healthProfile.baselines?.restingHR} BPM</p>
                  </div>
                </div>
              </div>
              
              <h4 className="font-bold text-sm uppercase text-gray-400 mb-2">Health Goals</h4>
              <div className="bg-gray-700 rounded-lg p-3 mb-4">
                <ul className="space-y-1">
                  {healthProfile.healthGoals?.map((goal, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check size={16} className="text-green-500 mr-2" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Measurement overlay */}
      {isMeasuring && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut" 
              }}
              className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <Heart size={32} className="text-red-500" />
            </motion.div>
            
            <h2 className="text-xl font-bold mb-2">
              {calibrating ? 'Calibrating...' : 'Measuring Heart Rate'}
            </h2>
            <p className="text-sm text-gray-300 mb-4">
              {calibrating 
                ? 'Please keep your finger steady on the camera' 
                : 'Almost there! Keep your finger in place'}
            </p>
            
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
              <motion.div 
                className="bg-red-500 h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${measurementProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-400 mb-6">
              {measurementProgress < 100 
                ? `${Math.round(measurementProgress)}% complete` 
                : 'Processing results...'}
            </p>
            
            {heartRate && !calibrating && (
              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <div className="flex justify-center items-center">
                  <Heart className="text-red-500 mr-2" size={20} />
                  <span className="text-xl font-bold">{heartRate} BPM</span>
                </div>
              </div>
            )}
            
            <button
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center"
              onClick={stopMeasurement}
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add a function to calculate heart rate variability (HRV)
const calculateHRV = (heartRates: number[]) => {
  if (heartRates.length < 2) return 0;
  
  // Convert heart rates to RR intervals (in ms)
  const rrIntervals = heartRates.map(hr => 60000 / hr);
  
  // Calculate RMSSD (Root Mean Square of Successive Differences)
  let sumSquaredDiffs = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    const diff = rrIntervals[i] - rrIntervals[i-1];
    sumSquaredDiffs += diff * diff;
  }
  
  const rmssd = Math.sqrt(sumSquaredDiffs / (rrIntervals.length - 1));
  return rmssd;
};

export default AIHeartRateMonitor; 