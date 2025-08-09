'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const VoterDashboard = () => {
  // Use AuthContext for user info and logout
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  
  const [selectedSession, setSelectedSession] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [votingToken, setVotingToken] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokenVerified, setTokenVerified] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  
  // API state
  const [votingSession, setVotingSession] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5205/api';

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem('auth-token') || user?.token;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      window.location.href = '/voter/login';
    }
  };

  // Fetch voting session data for voter
  const fetchVotingSession = async () => {
    setIsLoadingData(true);
    setApiError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/VotingSession/GetByVoter`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status) {
        setVotingSession(data.data);
      } else {
        setApiError(data.message || 'Failed to fetch voting session');
        setVotingSession(null);
      }
    } catch (error) {
      console.error('Error fetching voting session:', error);
      setApiError(error.message || 'Network error occurred');
      setVotingSession(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Submit vote using API
  const submitVote = async (candidateId, voteToken) => {
    setIsSubmittingVote(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/Vote/Create/${encodeURIComponent(voteToken)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidateId,
          voteToken: voteToken
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        // Vote submitted successfully
        alert(data.message || 'Vote submitted successfully!');
        
        // Refresh the voting session data
        await fetchVotingSession();
        
        // Reset voting state
        setIsVoting(false);
        setSelectedSession(null);
        setSelectedCandidate('');
        setGeneratedToken('');
        setTokenVerified(false);
        setVotingToken('');
        setShowTokenModal(false);
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to submit vote' };
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      return { success: false, message: error.message || 'Network error occurred' };
    } finally {
      setIsSubmittingVote(false);
    }
  };

  // Redirect if not authenticated or not a voter
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role?.toLowerCase() !== 'voter')) {
      window.location.href = '/voter/login';
    }
  }, [isAuthenticated, isLoading, user]);

  // Load voting session when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === 'voter') {
      fetchVotingSession();
    }
  }, [isAuthenticated, user]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || user?.role?.toLowerCase() !== 'voter') {
    return null;
  }

  // Check if voting is currently active
  const isVotingActive = () => {
    if (!votingSession) return false;
    
    const currentDateTime = new Date();
    const votingDate = new Date(votingSession.votingDate);
    const startTime = votingSession.startTime;
    const endTime = votingSession.endTime;
    
    // Check if it's the voting date
    const currentDateStr = currentDateTime.toISOString().split('T')[0];
    const votingDateStr = votingDate.toISOString().split('T')[0];
    
    if (currentDateStr !== votingDateStr) {
      return currentDateStr > votingDateStr ? false : false; // Past or future date
    }
    
    // If it's the voting date, check time
    const currentTimeStr = currentDateTime.toTimeString().slice(0, 8);
    return currentTimeStr >= startTime && currentTimeStr <= endTime;
  };

  // Get voting session status
  const getSessionStatus = () => {
    if (!votingSession) return { status: 'unknown', text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    
    // Check if voter has already voted
    const voterInfo = votingSession.voters?.find(v => v.voterId === user?.id);
    if (voterInfo?.hasVoted) {
      return { status: 'voted', text: 'Voted', color: 'bg-green-100 text-green-800' };
    }
    
    if (isVotingActive()) {
      return { status: 'active', text: 'Vote Now', color: 'bg-blue-100 text-blue-800' };
    }
    
    const currentDateTime = new Date();
    const votingDate = new Date(votingSession.votingDate);
    const currentDateStr = currentDateTime.toISOString().split('T')[0];
    const votingDateStr = votingDate.toISOString().split('T')[0];
    
    if (currentDateStr > votingDateStr) {
      return { status: 'completed', text: 'Completed', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { status: 'upcoming', text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  // Calculate vote percentages
  const calculatePercentages = (candidates) => {
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votesCount, 0);
    return candidates.map(candidate => ({
      ...candidate,
      percentage: totalVotes > 0 ? ((candidate.votesCount / totalVotes) * 100).toFixed(1) : 0
    }));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { type: "spring", stiffness: 300 } }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate');
      return;
    }
    
    if (!generatedToken) {
      alert('Please generate and verify your voting token first');
      return;
    }
    
    const result = await submitVote(selectedCandidate, generatedToken);
    
    if (!result.success) {
      alert(result.message);
    }
  };

  // Generate voting token using API
  const generateVotingToken = async () => {
    setIsGeneratingToken(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/Voter/GenerateToken`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Check if response is ok first
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.status) {
        setGeneratedToken('generated'); // Mark that token was generated
        alert(data.data?.message || 'Voting token has been sent to your registered email address.');
      } else {
        alert(data.message || 'Failed to generate voting token');
      }
    } catch (error) {
      console.error('Error generating token:', error);
      
      if (error.message.includes('JSON')) {
        alert('Server response error. The token may have been generated. Please check your email or try again.');
      } else if (error.message.includes('HTTP error')) {
        alert(`Request failed with status ${error.message.split('status: ')[1]}. Please try again.`);
      } else {
        alert('Network error occurred while generating token');
      }
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Verify voting token using API
  const verifyVotingToken = async () => {
    if (!votingToken.trim()) {
      alert('Please enter a voting token');
      return;
    }
    
    setIsVerifyingToken(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/Vote/VerifyToken/${encodeURIComponent(votingToken)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      console.log('Token verification response:', data); // Debug log

      if (response.ok && data.status) {
        // Check if the token is valid from the response
        if (data.data?.isValid || data.data?.valid || data.status) {
          // Store the original voting token as the verified token
          setGeneratedToken(votingToken); 
          setTokenVerified(true);
          setShowTokenModal(false);
          setIsVoting(true);
          alert('Token verified successfully! You can now cast your vote.');
        } else {
          alert('Invalid voting token. Please check and try again.');
        }
      } else {
        alert(data.message || 'Invalid voting token. Please check and try again.');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      alert('Network error occurred while verifying token');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleCastVoteClick = (session) => {
    const status = getSessionStatus();
    
    if (status.status === 'voted') {
      alert('You have already voted in this session.');
      return;
    }
    
    if (status.status !== 'active') {
      alert('Voting is not currently active for this session.');
      return;
    }
    
    setSelectedSession(session);
    setShowTokenModal(true);
    setTokenVerified(false);
    setVotingToken('');
    setGeneratedToken('');
  };

  const getCandidateColor = (index) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600', 
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600'
    ];
    return colors[index % colors.length];
  };

  const getCandidateDotColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500', 
      'bg-orange-500',
      'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-xl"
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Voter Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base hidden sm:block">Cast your vote and monitor election progress</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
              <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                <i className="ri-shield-check-line mr-1"></i>
                <span className="hidden sm:inline">Verified Voter</span>
                <span className="sm:hidden">Verified</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2"
                title="Logout"
              >
                <i className="ri-logout-box-line text-lg sm:text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Loading State */}
        {isLoadingData && (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading voting session...</p>
          </div>
        )}

        {/* Error State */}
        {apiError && !isLoadingData && (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 max-w-md mx-auto">
              <i className="ri-error-warning-line text-3xl sm:text-4xl text-red-500 mb-4"></i>
              <h3 className="text-base sm:text-lg font-medium text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-red-700 mb-4 text-sm sm:text-base">{apiError}</p>
              <button 
                onClick={fetchVotingSession}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                <i className="ri-refresh-line mr-2"></i>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Voting Session */}
        {!isLoadingData && !apiError && votingSession && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">
                    {votingSession.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">
                    {votingSession.description}
                  </p>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getSessionStatus().color}`}>
                  {getSessionStatus().text}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <i className="ri-group-line mr-2"></i>
                  <span>{votingSession.candidates?.length || 0} candidates</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="ri-calendar-line mr-2"></i>
                  <span>Date: {new Date(votingSession.votingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="ri-time-line mr-2"></i>
                  <span>{votingSession.startTime} - {votingSession.endTime}</span>
                </div>
              </div>

              {/* Show progress if voter has voted or voting is completed */}
              {(getSessionStatus().status === 'voted' || getSessionStatus().status === 'completed') && votingSession.candidates?.length > 0 && (
                <div className="mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">Current Results:</h4>
                  <div className="space-y-3">
                    {calculatePercentages(votingSession.candidates).slice(0, 3).map((candidate, idx) => (
                      <div key={candidate.id} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getCandidateDotColor(idx)}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium truncate pr-2">{candidate.fullName}</span>
                            <span className="whitespace-nowrap">{candidate.percentage}% ({candidate.votesCount})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <motion.div
                              className={`h-1 rounded-full bg-gradient-to-r ${getCandidateColor(idx)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${candidate.percentage}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button 
                  onClick={() => handleCastVoteClick(votingSession)}
                  disabled={getSessionStatus().status === 'voted' || getSessionStatus().status !== 'active'}
                  className={`w-full sm:flex-1 py-2.5 sm:py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    getSessionStatus().status === 'voted' || getSessionStatus().status !== 'active'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  <i className="ri-vote-line mr-2"></i>
                  {getSessionStatus().status === 'voted' ? 'Vote Cast' : 'Cast Vote'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedSession(votingSession);
                    setShowProgress(true);
                  }}
                  className="w-full sm:flex-1 bg-green-600 text-white py-2.5 sm:py-2 px-4 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <i className="ri-bar-chart-line mr-2"></i>
                  View Progress
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoadingData && !apiError && !votingSession && (
          <motion.div
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <i className="ri-inbox-line text-3xl sm:text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No voting session assigned</h3>
            <p className="text-gray-600 text-sm sm:text-base">You are not currently assigned to any voting session.</p>
          </motion.div>
        )}
      </div>

      {/* Voting Token Modal */}
      <AnimatePresence>
        {showTokenModal && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTokenModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Voting Verification</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Generate and verify your voting token</p>
                </div>
                <button
                  onClick={() => setShowTokenModal(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <i className="ri-close-line text-gray-600 text-lg sm:text-xl"></i>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">{/* Election Info */}
                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">{selectedSession.title}</h3>
                  <p className="text-xs sm:text-sm text-blue-700 line-clamp-2">{selectedSession.description}</p>
                </div>

                {/* Step 1: Generate Token */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3">1</div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Generate Voting Token</h4>
                  </div>
                  
                  {!generatedToken ? (
                    <button
                      onClick={generateVotingToken}
                      disabled={isGeneratingToken}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                    >
                      {isGeneratingToken ? (
                        <>
                          <i className="ri-loader-4-line mr-2 animate-spin"></i>
                          <span className="hidden sm:inline">Sending token to email...</span>
                          <span className="sm:hidden">Sending...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-mail-line mr-2"></i>
                          <span className="hidden sm:inline">Send Voting Token to Email</span>
                          <span className="sm:hidden">Send Token</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center">
                        <i className="ri-mail-check-line text-xl sm:text-2xl text-green-600 mr-3"></i>
                        <div className="flex-1">
                          <p className="text-sm text-green-700 mb-1">Voting token sent successfully!</p>
                          <p className="text-xs text-green-600">Check your registered email address for the 6-digit voting token.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Verify Token */}
                {generatedToken && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3">2</div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Enter Token from Email</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={votingToken}
                        onChange={(e) => setVotingToken(e.target.value)}
                        placeholder="Enter 6-digit token"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg sm:text-xl tracking-wider font-bold"
                        maxLength="6"
                      />
                      
                      <button
                        onClick={verifyVotingToken}
                        disabled={!votingToken.trim() || isVerifyingToken}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                      >
                        {isVerifyingToken ? (
                          <>
                            <i className="ri-loader-4-line mr-2 animate-spin"></i>
                            <span className="hidden sm:inline">Verifying Token...</span>
                            <span className="sm:hidden">Verifying...</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-shield-check-line mr-2"></i>
                            <span className="hidden sm:inline">Verify Token & Proceed to Vote</span>
                            <span className="sm:hidden">Verify & Vote</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start">
                    <i className="ri-shield-line text-yellow-600 mr-2 mt-0.5 text-lg"></i>
                    <div className="text-sm">
                      <p className="text-yellow-800 font-medium">Security Notice</p>
                      <p className="text-yellow-700">Your voting token will be sent to your registered email address. Please check your inbox and spam folder. Do not share this token with anyone.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voting Modal */}
      <AnimatePresence>
        {isVoting && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVoting(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{selectedSession.title}</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Select your candidate</p>
                </div>
                <button
                  onClick={() => setIsVoting(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <i className="ri-close-line text-gray-600 text-lg sm:text-xl"></i>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {selectedSession.candidates?.map((candidate, index) => (
                  <motion.label
                    key={candidate.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`block p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedCandidate === candidate.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate.id}
                        checked={selectedCandidate === candidate.id}
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-3 sm:mr-4 mt-1 flex items-center justify-center ${
                        selectedCandidate === candidate.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCandidate === candidate.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                          />
                        )}
                      </div>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden mr-3 sm:mr-4 border-3 border-gray-200 shadow-lg flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <i className="ri-user-line text-lg sm:text-2xl text-gray-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate">{candidate.fullName}</div>
                        <div className="text-sm text-gray-600 mb-2 truncate">{candidate.position}</div>
                        {/* Show vote count if available */}
                        {candidate.votesCount !== undefined && (
                          <div className="text-xs text-blue-600">
                            Current votes: {candidate.votesCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.label>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setIsVoting(false)}
                  className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoteSubmit}
                  disabled={!selectedCandidate || isSubmittingVote}
                  className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                >
                  {isSubmittingVote ? (
                    <>
                      <i className="ri-loader-4-line mr-2 animate-spin"></i>
                      <span className="hidden sm:inline">Submitting Vote...</span>
                      <span className="sm:hidden">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line mr-2"></i>
                      Submit Vote
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 sm:mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start">
                  <i className="ri-warning-line text-yellow-600 mr-2 mt-0.5 text-lg"></i>
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">Important Notice</p>
                    <p className="text-yellow-700">Once submitted, your vote cannot be changed. Please review your selection carefully.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgress && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProgress(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{selectedSession.title}</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Real-time Election Progress</p>
                </div>
                <button
                  onClick={() => setShowProgress(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <i className="ri-close-line text-gray-600 text-lg sm:text-xl"></i>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm">Total Votes</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {selectedSession.candidates?.reduce((sum, candidate) => sum + (candidate.votesCount || 0), 0).toLocaleString() || 0}
                      </p>
                    </div>
                    <i className="ri-checkbox-circle-line text-2xl sm:text-3xl text-blue-200"></i>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs sm:text-sm">Total Voters</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {selectedSession.voters?.length || 0}
                      </p>
                    </div>
                    <i className="ri-group-line text-2xl sm:text-3xl text-green-200"></i>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs sm:text-sm">Turnout</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {selectedSession.voters?.length ? 
                          Math.round((selectedSession.voters.filter(v => v.hasVoted).length / selectedSession.voters.length) * 100) : 0}%
                      </p>
                    </div>
                    <i className="ri-pie-chart-line text-2xl sm:text-3xl text-purple-200"></i>
                  </div>
                </div>
              </div>

              {/* Candidates Results */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Current Results</h3>
                <div className="space-y-3 sm:space-y-4">
                  {calculatePercentages(selectedSession.candidates || []).map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4 sm:p-6"
                    >
                      <div className="flex items-start mb-3 sm:mb-4">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-3 sm:mr-4 mt-1 ${getCandidateDotColor(index)}`}></div>
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden mr-3 sm:mr-4 border-3 border-white shadow-md flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <i className="ri-user-line text-lg sm:text-2xl text-gray-600"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-gray-900 text-sm sm:text-lg block truncate">{candidate.fullName}</span>
                                <span className="text-xs sm:text-sm text-gray-600 truncate">({candidate.position})</span>
                              </div>
                              <div className="text-right ml-4">
                                <span className="font-bold text-gray-900 text-sm sm:text-base block">{candidate.votesCount?.toLocaleString() || 0} votes</span>
                                <span className="text-xs sm:text-sm text-gray-600">({candidate.percentage || 0}%)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <motion.div
                          className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${getCandidateColor(index)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.percentage || 0}%` }}
                          transition={{ duration: 1.2, delay: index * 0.2, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Live Updates Indicator */}
              <div className="mt-4 sm:mt-6 flex items-center justify-center">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full mr-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Results update in real-time
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoterDashboard;