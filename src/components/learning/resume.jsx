import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Send, Briefcase, CheckCircle, Volume2, X, Check, ArrowRight, BarChart, Search, Zap, List, FileUp, Trash2, Download } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyDYkEfit-LZ6afs61_PS8YM6Jaws-Ztf1s"; 

const ResumeProcessor = () => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [step, setStep] = useState(1);
  const [selectedAction, setSelectedAction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const genAI = new GoogleGenerativeAI('AIzaSyDm2ODVscz6kNEsHPo4yWlyyRMiGXWFLQA');

  const actions = [
    { id: 'ats-score', label: 'Get ATS Score', description: 'Calculate how well your resume might perform in ATS systems' },
    { id: 'ats-enhancer', label: 'ATS Enhancer', description: 'Get specific suggestions to make your resume more ATS-friendly' },
    { id: 'resume-feedback', label: 'Resume Feedback', description: 'Receive detailed feedback on each section of your resume' },
    { id: 'keyword-match', label: 'Match Keywords', description: 'See how your resume keywords match with the job description' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        setFileContent(event.target.result);
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleActionSelect = (actionId) => {
    setSelectedAction(actionId);
  };

  const extractBasicInfo = (pdfText) => {
    const nameMatch = pdfText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m) || 
                      pdfText.match(/([A-Z][a-z]+ [A-Z][a-z]+)\n/);
    const name = nameMatch ? nameMatch[1] : "professional";
    
    const jobTitleMatch = pdfText.match(/\n((?:Senior|Junior|Lead)?\s?[A-Za-z]+ (?:Developer|Engineer|Designer|Manager|Specialist|Analyst|Consultant))/m);
    const jobTitle = jobTitleMatch ? jobTitleMatch[1] : "";
    
    const yearsExpMatch = pdfText.match(/([0-9]+)\+?\s?years of experience/i);
    const yearsExperience = yearsExpMatch ? yearsExpMatch[1] : "";

    return {
      name,
      jobTitle,
      yearsExperience
    };
  };

  const processWithGemini = async () => {
    setIsLoading(true);
    
    try {
      const pdfText = await extractTextFromPDF(fileContent);
      const basicInfo = extractBasicInfo(pdfText);
      
      let promptText = '';
      
      if (selectedAction === 'ats-score') {
        promptText = `I need analysis for a resume based on a job description.
        
        ACTION: ATS Score
        
        RESUME CONTENT:
        ${pdfText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Provide a detailed ATS compatibility score analysis in markdown format.
        Include a score out of 100 with breakdowns for different aspects like keyword matching, 
        format compatibility, section organization, and overall readability.
        Do not include any other analysis besides the ATS score.`;
      } else if (selectedAction === 'ats-enhancer') {
        promptText = `I need personalized analysis for ${basicInfo.name}'s resume based on a job description.
        
        RESUME CONTENT:
        ${pdfText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        First, provide a personalized greeting that includes the person's name (${basicInfo.name}) and a brief
        summary of what you've understood about them from their resume (e.g., their experience level, current role,
        industry, key strengths, etc.).
        
        Then, provide an ATS compatibility score out of 100 with a brief breakdown.
        
        Next, provide specific recommendations to enhance the resume's ATS compatibility. Include:
        1. Format improvements to make the resume more ATS-friendly
        2. Content enhancements including missing keywords from the job description, personalized to their background
        3. Section-by-section recommendations that reference their specific experiences and skills
        
        Throughout your analysis, refer to them by name and make connections between their background and the job requirements.
        
        Present your analysis in markdown format.`;
      } else if (selectedAction === 'resume-feedback') {
        promptText = `I need personalized feedback for ${basicInfo.name}'s resume based on a job description.
        
        RESUME CONTENT:
        ${pdfText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        First, provide a personalized greeting that includes the person's name (${basicInfo.name}) and a brief
        summary of what you've understood about them from their resume (their background, experience level, 
        key skills, career trajectory, etc.).
        
        Then, provide an ATS compatibility score out of 100 with a brief breakdown.
        
        Next, provide detailed section-by-section feedback on the resume. For each section (Contact Information, 
        Professional Summary, Work Experience, Skills, Education, etc.), include strengths (marked with ✅) 
        and improvement areas (marked with ⚠️). Make this feedback specific to their actual experiences and skills,
        not generic advice.
        
        Throughout your analysis, refer to them by name and make specific references to their background, using details
        from their resume to personalize the feedback.
        
        Present your analysis in markdown format.`;
      } else if (selectedAction === 'keyword-match') {
        promptText = `I need analysis for a resume based on a job description.
        
        RESUME CONTENT:
        ${pdfText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        First, provide an ATS compatibility score out of 100 with a brief breakdown.
        
        Then, analyze how well the resume's keywords match with the job description. Include:
        1. A table showing key terms from the job description and whether they appear in the resume
        2. Missing keywords that should be added
        3. Recommendations for keyword placement
        4. Overall keyword match score as a percentage
        
        Present your analysis in markdown format.
        Do not include any other analysis besides the ATS score and keyword matching analysis.`;
      }
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setResult(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid response from Gemini API');
      }
      
      setStep(4);
    } catch (error) {
      console.error("Error processing with Gemini API:", error);
      setResult("Sorry, there was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const extractTextFromPDF = async (pdfBuffer) => {
    try {
      // In a real implementation, you would extract text from the PDF
      // This is a placeholder that simulates a resume for a software developer
      return `Jane Smith
123 Main Street, San Francisco, CA 94105
jane.smith@email.com | (555) 123-4567 | linkedin.com/in/janesmith

SOFTWARE ENGINEER
Innovative Software Engineer with 5+ years of experience in full-stack development and cloud solutions.
Passionate about creating efficient, scalable applications using modern technologies.

SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java, SQL
Frameworks & Libraries: React, Node.js, Express, Django, Spring Boot
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform
Databases: MongoDB, PostgreSQL, MySQL, Redis
Other: RESTful APIs, GraphQL, Microservices, Agile/Scrum

EXPERIENCE
Senior Software Engineer | TechCorp Inc., San Francisco, CA | 2020 - Present
- Architected and implemented scalable microservices using Node.js and Kubernetes
- Led migration from monolithic architecture to microservices, reducing deployment time by 70%
- Mentored junior developers and conducted code reviews to ensure quality and best practices
- Implemented CI/CD pipelines using Jenkins, reducing release cycles by 40%

Software Developer | InnoSoft Solutions, San Francisco, CA | 2018 - 2020
- Developed responsive web applications using React and Redux
- Built and maintained RESTful APIs using Express and MongoDB
- Collaborated with UI/UX designers to implement intuitive user interfaces
- Optimized database queries, improving application performance by 35%

Junior Developer | CodeWave Technologies, Oakland, CA | 2016 - 2018
- Assisted in developing and maintaining e-commerce platforms
- Implemented front-end features using JavaScript and jQuery
- Fixed bugs and performed code refactoring to improve maintainability
- Participated in daily stand-ups and sprint planning meetings

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2016
- GPA: 3.8/4.0
- Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development

PROJECTS
Personal Budget Tracker
- Developed a full-stack application using MERN stack (MongoDB, Express, React, Node.js)
- Implemented user authentication, data visualization, and expense categorization

Weather Forecast App
- Created a responsive web app using React that displays weather forecasts
- Integrated with OpenWeatherMap API and implemented geolocation services

CERTIFICATIONS
- AWS Certified Developer - Associate (2022)
- MongoDB Certified Developer (2021)
- Google Cloud Professional Developer (2020)`;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from the PDF");
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileContent(null);
    setJobDescription('');
    setStep(1);
    setSelectedAction('');
    setResult('');
    setIsReading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      speechSynthesisRef.current = null;
    }
  };

  const goToJobDescription = () => {
    if (file) {
      setStep(2);
    } else {
      alert('Please upload a resume first');
    }
  };

  const goToOptions = () => {
    if (jobDescription.trim()) {
      setStep(3);
    } else {
      alert('Please enter a job description');
    }
  };
  
  const readText = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      speechSynthesisRef.current = null;
      return;
    }
    
   
    const plainText = result
      .replace(/#{1,6} (.*)/g, '$1. ') 
      .replace(/\*\*(.*?)\*\*/g, '$1') 
      .replace(/\*(.*?)\*/g, '$1')     
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') 
      .replace(/`(.*?)`/g, '$1')      
      .replace(/```.*?```/gs, '')     
      .replace(/\n/g, ' ')             
      .replace(/\s+/g, ' ')            
      .replace(/✅/g, 'Strength: ')    
      .replace(/⚠️/g, 'Area for improvement: '); 
    
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Select a voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Google'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      setIsReading(false);
      speechSynthesisRef.current = null;
    };
    
    window.speechSynthesis.speak(utterance);
    speechSynthesisRef.current = utterance;
    setIsReading(true);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 min-h-[80vh] p-2 md:p-6 rounded-lg">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-4 md:mb-6">
        Resume Processor & Analyzer
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        {/* Left Column - File Upload & Job Description */}
        <div className="space-y-4">
          {/* File Upload Area */}
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-4 md:p-8 text-center cursor-pointer transition-colors ${
                isMobile 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-300 hover:border-indigo-500 dark:border-gray-700'
              }`}
              onClick={() => document.getElementById('resume-upload').click()}
            >
              <input 
                type="file" 
                id="resume-upload" 
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange}
              />
              
              <FileUp className="w-10 h-10 md:w-16 md:h-16 mx-auto text-indigo-500 mb-2" />
              <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                {isMobile ? 'Drop your PDF resume here' : 'Drag & drop your resume, or click to browse'}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Supports PDF format only
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-6 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 mr-2" />
                  <span className="font-medium truncate max-w-[150px] md:max-w-xs text-sm md:text-base">
                    {file.name}
                  </span>
                </div>
                <div className="flex space-x-1 md:space-x-2">
                  <button 
                    className="p-1 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={resetForm}
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs md:text-sm font-mono max-h-[150px] md:max-h-[250px] overflow-y-auto">
                {fileContent ? fileContent.substring(0, 300) + '...' : 'Extracting text...'}
              </div>
            </div>
          )}
          
          {/* Analysis Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-6 shadow-md">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Choose Analysis Type
            </h2>
            
            <div className="space-y-2">
              <label className={`flex items-start p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAction === 'ats-score' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input 
                  type="radio" 
                  name="action" 
                  value="ats-score" 
                  checked={selectedAction === 'ats-score'} 
                  onChange={() => setSelectedAction('ats-score')} 
                  className="mt-0.5 text-indigo-600"
                />
                <div className="ml-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center">
                    <BarChart className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    ATS Compatibility Score
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Check if your resume passes through ATS systems and receive a score
                  </p>
                </div>
              </label>
              
              <label className={`flex items-start p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAction === 'ats-enhancer' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input 
                  type="radio" 
                  name="action" 
                  value="ats-enhancer" 
                  checked={selectedAction === 'ats-enhancer'} 
                  onChange={() => setSelectedAction('ats-enhancer')} 
                  className="mt-0.5 text-indigo-600"
                />
                <div className="ml-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center">
                    <BarChart className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    ATS Enhancer
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Get specific suggestions to make your resume more ATS-friendly
                  </p>
                </div>
              </label>
              
              <label className={`flex items-start p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAction === 'resume-feedback' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input 
                  type="radio" 
                  name="action" 
                  value="resume-feedback" 
                  checked={selectedAction === 'resume-feedback'} 
                  onChange={() => setSelectedAction('resume-feedback')} 
                  className="mt-0.5 text-indigo-600"
                />
                <div className="ml-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center">
                    <BarChart className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    Resume Feedback
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Receive detailed feedback on each section of your resume
                  </p>
                </div>
              </label>
              
              <label className={`flex items-start p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAction === 'keyword-match' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input 
                  type="radio" 
                  name="action" 
                  value="keyword-match" 
                  checked={selectedAction === 'keyword-match'} 
                  onChange={() => setSelectedAction('keyword-match')} 
                  className="mt-0.5 text-indigo-600"
                />
                <div className="ml-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center">
                    <BarChart className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    Keyword Match Analysis
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    See how well your resume keywords match with the job description
                  </p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Job Description */}
          {selectedAction !== 'ats-score' && selectedAction !== 'ats-enhancer' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-6 shadow-md">
              <h2 className="text-base md:text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Job Description
              </h2>
              
              <textarea 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..." 
                className="w-full h-[100px] md:h-[150px] p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-200 text-sm md:text-base"
              />
            </div>
          )}
          
          {/* Action Button */}
          <button 
            onClick={processWithGemini}
            disabled={!file || isLoading}
            className="w-full py-2 md:py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg shadow-md font-medium flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                {selectedAction === 'ats-score' ? 'Calculate ATS Score' : 
                 selectedAction === 'ats-enhancer' ? 'ATS Enhancer' : 
                 selectedAction === 'resume-feedback' ? 'Resume Feedback' : 
                 'Check Keyword Match'}
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </>
            )}
          </button>
        </div>
        
        {/* Right Column - Analysis Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 md:p-6 min-h-[300px] md:min-h-[500px]">
          <h2 className="text-base md:text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            {result ? 'Analysis Results' : 'Upload your resume to get started!'}
          </h2>
          
          {result ? (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: result.replace(/\n\n/g, '<br/><br/>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" />
              <p className="text-sm md:text-base">
                Upload your resume PDF and choose an analysis type to get personalized feedback
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeProcessor;