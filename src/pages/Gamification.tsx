import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Award, Zap, Network, Server, Battery, Cloud, ChevronDown, Users, BarChart2, BookOpen, UserRound, FileText, MessageSquare, PlaySquare, Heart } from 'lucide-react';
import LearningRoadmap from '../components/learning/LearningRoadmap';
import InterviewPrep from '../components/learning/interview';
import ResumeProcessor from '../components/learning/resume';
import Chatbot from '../components/learning/aichatsustain';
import YouTubeLearning from '../components/learning/YouTubeLearning';
import AIHeartRateMonitor from '../components/learning/AIHeartRateMonitor';
import { MdEco } from 'react-icons/md';

const EnhancedGamification = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [networkStats, setNetworkStats] = useState({
    uptime: 99.8,
    energyEfficiency: 92,
    bandwidth: 85,
    servers: 245
  });
  const [showAchievement, setShowAchievement] = useState(false);
  const [userPoints, setUserPoints] = useState(8750);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const achievements = [
    {
      id: 1,
      title: 'Energy Master',
      description: 'Achieve 95% energy efficiency across all sites',
      progress: 85,
      reward: '500 Green Points',
      deadline: '2d 4h',
      tasks: [
        { name: 'Optimize Server Load', complete: true },
        { name: 'Implement Smart Cooling', complete: true },
        { name: 'Deploy Energy Monitors', complete: false }
      ]
    },
    {
      id: 2,
      title: 'Sustainability Champion',
      description: 'Maintain 100% renewable energy usage for 30 days',
      progress: 60,
      reward: '1000 Green Points',
      deadline: '15d',
      tasks: [
        { name: 'Solar Panel Installation', complete: true },
        { name: 'Wind Energy Integration', complete: false },
        { name: 'Battery Storage Setup', complete: false }
      ]
    },
    {
      id: 3,
      title: 'Innovation Pioneer',
      description: 'Implement 5 AI-powered optimizations',
      progress: 40,
      reward: '750 Green Points',
      deadline: '7d',
      tasks: [
        { name: 'ML Traffic Prediction', complete: true },
        { name: 'AI Cooling System', complete: false },
        { name: 'Smart Grid Integration', complete: false }
      ]
    }
  ];

  const leaderboard = [
    { name: 'TelecomCo International', points: 12500, rank: 1, trend: 'up' },
    { name: 'Global Networks Ltd', points: 11200, rank: 2, trend: 'down' },
    { name: 'EcoTech Solutions', points: 10800, rank: 3, trend: 'up' },
    { name: 'Green Telecom Corp', points: 9500, rank: 4, trend: 'stable' },
    { name: 'Future Communications', points: 8900, rank: 5, trend: 'up' }
  ];

  const networkMetrics = [
    {
      title: 'Network Uptime',
      value: '99.8%',
      change: '+0.2%',
      trend: 'up',
      icon: Network,
      color: 'text-blue-500'
    },
    {
      title: 'Energy Efficiency',
      value: '92%',
      change: '+5%',
      trend: 'up',
      icon: Battery,
      color: 'text-green-500'
    },
    {
      title: 'Server Load',
      value: '85%',
      change: '-2%',
      trend: 'down',
      icon: Server,
      color: 'text-yellow-500'
    },
    {
      title: 'Cloud Usage',
      value: '78%',
      change: '+8%',
      trend: 'up',
      icon: Cloud,
      color: 'text-purple-500'
    }
  ];

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        uptime: Math.min(100, prev.uptime + (Math.random() * 0.2 - 0.1)),
        energyEfficiency: Math.min(100, prev.energyEfficiency + (Math.random() * 0.5 - 0.25)),
        bandwidth: Math.min(100, prev.bandwidth + (Math.random() * 1 - 0.5)),
        servers: prev.servers + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Achievement completion simulation
  const completeTask = (achievementId, taskIndex) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.tasks[taskIndex].complete = true;
      setShowAchievement(true);
      setUserPoints(prev => prev + 100);
      setTimeout(() => setShowAchievement(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-1 md:p-6">
      {/* Navigation */}
      <div className="navbar bg-base-200 rounded-box mb-2 md:mb-6 p-1 md:p-2">
        <div className="flex-none w-full overflow-x-auto hide-scrollbar">
          <div className="tabs tabs-boxed bg-base-300 w-full justify-center">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
              { id: 'interview', label: 'Interview Prep', icon: UserRound },
              { id: 'resume', label: 'Resume Builder', icon: FileText },
              { id: 'learning', label: 'Learning Paths', icon: BookOpen },
              { id: 'videos', label: 'Learning Videos', icon: PlaySquare },
              { id: 'aichat', label: 'AI Assistant', icon: MessageSquare },
              { id: 'heartrate', label: 'Heart Rate', icon: Heart }
            ].map(tab => (
              <a
                key={tab.id}
                className={`tab gap-1 ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm whitespace-nowrap">
                  {isMobile ? 
                    (tab.id === 'interview' ? 'Interview' : 
                     tab.id === 'learning' ? 'Learn' : 
                     tab.id === 'resume' ? 'Resume' : 
                     tab.id === 'dashboard' ? 'Home' : 
                     tab.id === 'videos' ? 'Videos' :
                     tab.id === 'aichat' ? 'Chat' :
                     tab.id === 'heartrate' ? 'Heart' : tab.label.substring(0, 6)) 
                    : tab.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-2 md:space-y-6"
        >
          {activeTab === 'learning' ? (
            <div className="card bg-base-200 shadow-xl overflow-hidden">
              <div className="card-body p-1 md:p-4">
                <LearningRoadmap className="text-base-content" />
              </div>
            </div>
          ) : activeTab === 'interview' ? (
            <div className="card bg-base-200 shadow-xl overflow-hidden">
              <div className="card-body p-0 md:p-4">
                <InterviewPrep />
              </div>
            </div>
          ) : activeTab === 'resume' ? (
            <div className="card bg-base-200 shadow-xl overflow-hidden">
              <div className="card-body p-0 md:p-4">
                <ResumeProcessor />
              </div>
            </div>
          ) : activeTab === 'aichat' ? (
            <div className="card bg-base-200 shadow-xl overflow-hidden h-[calc(100vh-100px)]">
              <div className="card-body p-0 md:p-4 h-full">
                <Chatbot />
              </div>
            </div>
          ) : activeTab === 'videos' ? (
            <div className="card bg-base-200 shadow-xl overflow-hidden">
              <div className="card-body p-0 md:p-4">
                <YouTubeLearning />
              </div>
            </div>
          ) : activeTab === 'heartrate' ? (
            <div className="card bg-base-200 shadow-xl overflow-hidden">
              <div className="card-body p-0 md:p-4">
                <AIHeartRateMonitor />
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                {networkMetrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="card bg-base-200 shadow-xl"
                  >
                    <div className="card-body p-2 md:p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="card-title text-xs md:text-base text-base-content">{metric.title}</h2>
                        <metric.icon className={`w-4 h-4 md:w-6 md:h-6 ${metric.color}`} />
                      </div>
                      <div className="flex items-end justify-between mt-1 md:mt-2">
                        <p className="text-lg md:text-2xl font-bold">{metric.value}</p>
                        <div className={`badge badge-xs md:badge-md ${metric.trend === 'up' ? 'badge-success' : 'badge-warning'}`}>
                          {metric.change}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Challenges Section */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-2 md:p-6">
                  <h2 className="card-title text-lg md:text-2xl mb-1 md:mb-4">Learning Achievements</h2>
                  <div className="space-y-1 md:space-y-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="collapse collapse-arrow bg-base-300"
                      >
                        <input type="radio" name="challenges-accordion" />
                        <div className="collapse-title text-sm md:text-xl font-medium py-1 md:py-2 min-h-0 md:min-h-[3rem]">
                          <div className="flex items-center justify-between flex-wrap gap-1 md:gap-2">
                            <span className="text-xs md:text-base">{achievement.title}</span>
                            <div className="badge badge-primary badge-xs md:badge-md">{achievement.deadline}</div>
                          </div>
                        </div>
                        <div className="collapse-content py-1 md:py-2">
                          <p className="text-xs md:text-sm text-base-content/80 mb-1 md:mb-4">{achievement.description}</p>
                          <progress
                            className="progress progress-success w-full mb-1 md:mb-4"
                            value={achievement.progress}
                            max="100"
                          ></progress>
                          <div className="space-y-1 md:space-y-2">
                            {achievement.tasks.map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className="flex items-center justify-between p-1 md:p-2 bg-base-200 rounded-lg"
                              >
                                <span className={`text-xs md:text-sm ${task.complete ? 'line-through opacity-50' : ''}`}>
                                  {task.name}
                                </span>
                                <button
                                  className={`btn btn-xs md:btn-sm ${task.complete ? 'btn-disabled' : 'btn-primary'}`}
                                  onClick={() => completeTask(achievement.id, taskIndex)}
                                  disabled={task.complete}
                                >
                                  {task.complete ? (isMobile ? '✓' : 'Completed') : (isMobile ? 'Do' : 'Complete')}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-2 md:p-6">
                  <h2 className="card-title text-lg md:text-2xl mb-1 md:mb-4">Learning Leaderboard</h2>
                  <div className="overflow-x-auto">
                    <table className="table table-xs md:table-md w-full">
                      <thead>
                        <tr>
                          <th className="text-xs md:text-sm">Rank</th>
                          <th className="text-xs md:text-sm">Company</th>
                          <th className="text-xs md:text-sm">Points</th>
                          <th className="text-xs md:text-sm">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((company, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={index < 3 ? 'font-bold' : ''}
                          >
                            <td>
                              <div className={`badge badge-xs md:badge-sm ${
                                index === 0 ? 'badge-warning' :
                                index === 1 ? 'badge-secondary' :
                                index === 2 ? 'badge-accent' :
                                'badge-ghost'
                              }`}>
                                #{company.rank}
                              </div>
                            </td>
                            <td className="text-xs md:text-sm">{isMobile ? company.name.substring(0, 10) + (company.name.length > 10 ? '...' : '') : company.name}</td>
                            <td className="text-xs md:text-sm">{company.points.toLocaleString()}</td>
                            <td>
                              <div className={`badge badge-xs md:badge-sm ${
                                company.trend === 'up' ? 'badge-success' :
                                company.trend === 'down' ? 'badge-error' :
                                'badge-ghost'
                              }`}>
                                {company.trend}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="toast toast-end z-50"
          >
            <div className="alert alert-success text-xs md:text-sm py-1 md:py-3">
              <Trophy className="w-4 h-4 md:w-6 md:h-6" />
              <span>Achievement unlocked! +100 points</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subscribe to Newsletter */}
      <div className="card bg-base-200 shadow-xl mt-4 md:mt-6">
        <div className="card-body p-2 md:p-6">
          <h2 className="text-sm md:text-lg font-bold text-base-content">Subscribe to Our Newsletter and Get Updated to our Latest Announcement</h2>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="input input-bordered w-full"
            />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGamification;
