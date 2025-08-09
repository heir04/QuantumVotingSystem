'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  // Use AuthContext for user info and logout
  const { user, logout, isAuthenticated, isLoading, makeAuthenticatedRequest } = useAuth();
  
  const [selectedSessionForProgress, setSelectedSessionForProgress] = useState('');
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState(null);
  const [selectedSessionForView, setSelectedSessionForView] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: '',
    position: '',
    candidates: [{ fullName: '' }]
  });
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: '',
    position: '',
    candidates: [{ fullName: '' }]
  });

  // State for real data
  const [votingSessions, setVotingSessions] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [apiError, setApiError] = useState('');
  const [uploadingSessionId, setUploadingSessionId] = useState(null);

  // Helper function to determine session status - memoized to prevent unnecessary recalculations
  const getSessionStatus = useMemo(() => {
    return (votingDate, startTime, endTime) => {
      const now = new Date();
      const sessionStart = new Date(`${votingDate}T${startTime}`);
      const sessionEnd = new Date(`${votingDate}T${endTime}`);
      
      if (now < sessionStart) return 'upcoming';
      if (now > sessionEnd) return 'completed';
      return 'active';
    };
  }, []);

  // Function to fetch voting sessions from backend - stable reference
  const loadVotingSessions = useCallback(async () => {
    if (!makeAuthenticatedRequest) return;
    
    setIsLoadingData(true);
    setApiError('');
    try {
      const response = await makeAuthenticatedRequest('/VotingSession/GetAll', {
        method: 'GET'
      });
      
      const result = await response.json();
      
      if (result.status && result.data) {
        // Transform backend data to match frontend format
        const transformedSessions = await Promise.all(
          result.data.map(async (session) => {
            try {
              // Get detailed session data including votes
              const detailResponse = await makeAuthenticatedRequest(`/VotingSession/Get/${session.id}`, {
                method: 'GET'
              });
              const detailResult = await detailResponse.json();
              
              if (detailResult.status && detailResult.data) {
                const sessionDetail = detailResult.data;
                const totalVoters = sessionDetail.voters?.length || 0;
                const votedCount = sessionDetail.voters?.filter(v => v.hasVoted).length || 0;
                const turnoutRate = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;
                
                // Calculate total votes across all candidates
                const totalVotes = sessionDetail.candidates?.reduce((sum, c) => sum + (c.votesCount || 0), 0) || 0;
                
                return {
                  id: session.id,
                  title: session.title,
                  description: session.description,
                  status: getSessionStatus(session.votingDate, session.startTime, session.endTime),
                  startTime: `${session.votingDate}T${session.startTime}`,
                  endTime: `${session.votingDate}T${session.endTime}`,
                  votersCount: totalVoters,
                  votedCount: votedCount,
                  candidates: sessionDetail.candidates?.map(c => ({
                    name: c.fullName,
                    votes: c.votesCount || 0,
                    percentage: totalVotes > 0 ? Math.round((c.votesCount / totalVotes) * 100 * 10) / 10 : 0
                  })) || [],
                  turnoutRate: turnoutRate
                };
              }
            } catch (error) {
              console.error(`Error loading details for session ${session.id}:`, error);
            }
            
            // Fallback if detailed data can't be loaded
            return {
              id: session.id,
              title: session.title,
              description: session.description,
              status: getSessionStatus(session.votingDate, session.startTime, session.endTime),
              startTime: `${session.votingDate}T${session.startTime}`,
              endTime: `${session.votingDate}T${session.endTime}`,
              votersCount: 0,
              votedCount: 0,
              candidates: [],
              turnoutRate: 0
            };
          })
        );
        
        setVotingSessions(transformedSessions.filter(s => s !== undefined));
      } else {
        setApiError(result.message || 'Failed to fetch voting sessions');
        setVotingSessions([]);
      }
    } catch (error) {
      console.error('Error fetching voting sessions:', error);
      setApiError('Network error. Please check your connection.');
      setVotingSessions([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [makeAuthenticatedRequest, getSessionStatus]);

  // Function to close edit modal
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedSessionForEdit(null);
    setEditForm({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endTime: '',
      position: '',
      candidates: [{ fullName: '' }]
    });
  }, []);

  // Handle form changes - stabilized callbacks to prevent rerenders
  const handleSessionFormChange = useCallback((field, value) => {
    setSessionForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle edit form changes - stabilized callbacks to prevent rerenders
  const handleEditFormChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCandidateChange = useCallback((index, field, value) => {
    setSessionForm(prev => ({
      ...prev,
      candidates: prev.candidates.map((candidate, i) => 
        i === index ? { ...candidate, [field]: value } : candidate
      )
    }));
  }, []);

  const handleEditCandidateChange = useCallback((index, field, value) => {
    setEditForm(prev => ({
      ...prev,
      candidates: prev.candidates.map((candidate, i) => 
        i === index ? { ...candidate, [field]: value } : candidate
      )
    }));
  }, []);

  const addCandidate = useCallback(() => {
    setSessionForm(prev => ({
      ...prev,
      candidates: [...prev.candidates, { fullName: '' }]
    }));
  }, []);

  const addEditCandidate = useCallback(() => {
    setEditForm(prev => ({
      ...prev,
      candidates: [...prev.candidates, { fullName: '' }]
    }));
  }, []);

  const removeCandidate = useCallback((index) => {
    if (sessionForm.candidates.length > 1) {
      setSessionForm(prev => ({
        ...prev,
        candidates: prev.candidates.filter((_, i) => i !== index)
      }));
    }
  }, [sessionForm.candidates.length]);

  const removeEditCandidate = useCallback((index) => {
    if (editForm.candidates.length > 1) {
      setEditForm(prev => ({
        ...prev,
        candidates: prev.candidates.filter((_, i) => i !== index)
      }));
    }
  }, [editForm.candidates.length]);

  // Redirect if not authenticated or not an organization
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role?.toLowerCase() !== 'organization')) {
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, isLoading, user]);

  // Fetch data when component mounts
  React.useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === 'organization') {
      loadVotingSessions();
    }
  }, [isAuthenticated, user, loadVotingSessions]);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Function to create new voting session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    if (!sessionForm.title || !sessionForm.description || !sessionForm.startDate || !sessionForm.position) {
      alert('Please fill in all required fields');
      return;
    }

    if (sessionForm.candidates.some(c => !c.fullName)) {
      alert('Please fill in all candidate names');
      return;
    }

    try {
      const sessionData = {
        title: sessionForm.title,
        description: sessionForm.description,
        startTime: sessionForm.startTime || '09:00:00',
        endTime: sessionForm.endTime || '17:00:00',
        votingDate: sessionForm.startDate,
        candidates: sessionForm.candidates.filter(c => c.fullName).map(c => ({
          fullName: c.fullName,
          position: sessionForm.position
        }))
      };

      const response = await makeAuthenticatedRequest('/VotingSession/Create', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();

      if (result.status) {
        alert('Voting session created successfully!');
        // Reset form
        setSessionForm({
          title: '',
          description: '',
          startDate: '',
          startTime: '',
          endTime: '',
          position: '',
          candidates: [{ fullName: '' }]
        });
        // Reload sessions
        loadVotingSessions();
      } else {
        alert(result.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating voting session:', error);
      alert('Network error. Please try again.');
    }
  };

  // Function to upload CSV
  const handleUploadCsvToSession = async (sessionId) => {
    const session = votingSessions.find(s => s.id === sessionId);
    if (!session) return;

    // Prevent CSV upload if session is completed
    if (session.status === 'completed') {
      alert('Cannot upload voters to a completed voting session.');
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadingSessionId(sessionId); // Start loading
        try {
          const formData = new FormData();
          formData.append('file', file);

          // Use fetch directly instead of makeAuthenticatedRequest for FormData
          const token = localStorage.getItem('auth-token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5205/api'}/Voter/Create/${sessionId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData
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

          const result = await response.json();

          if (result.status) {
            const successCount = result.data?.filter(v => v.status === 'success').length || 0;
            const failedCount = result.data?.filter(v => v.status === 'failed').length || 0;
            
            alert(
              `CSV Upload Complete!\n\n` +
              `✅ Successfully processed: ${successCount} voters\n` +
              `❌ Failed: ${failedCount} voters\n\n` +
              `${result.message || 'Upload completed'}`
            );
            
            // Reload sessions to update voter counts
            loadVotingSessions();
          } else {
            alert(result.message || 'Failed to upload CSV');
          }
        } catch (error) {
          console.error('Error uploading CSV:', error);
          
          if (error.message.includes('JSON')) {
            alert('Server response error. The file may have been uploaded but the response was malformed. Please refresh to check if voters were added.');
          } else if (error.message.includes('HTTP error')) {
            alert(`Upload failed with status ${error.message.split('status: ')[1]}. Please check the file format and try again.`);
          } else {
            alert('Network error occurred while uploading CSV. Please try again.');
          }
        } finally {
          setUploadingSessionId(null); // Stop loading
        }
      }
    };
    fileInput.click();
  };

  // Function to send invites
  const handleSendInvites = async (sessionId) => {
    const session = votingSessions.find(s => s.id === sessionId);
    if (!session) return;

    const confirmed = window.confirm(
      `Send voting invites to all ${session.votersCount} voters for "${session.title}"?\n\n` +
      `This will send email invitations with voting credentials and session details.`
    );

    if (confirmed) {
      try {
        const response = await makeAuthenticatedRequest(`/Voter/SendVotesEmail/${sessionId}`, {
          method: 'POST'
        });

        const result = await response.json();

        if (result.status) {
          alert(
            `🎉 Voting invites sent successfully!\n\n` +
            `✅ ${session.votersCount} invitations sent\n` +
            `📧 Voters will receive:\n` +
            `   • Voting credentials (Voter ID & PIN)\n` +
            `   • Session details and voting period\n` +
            `   • Direct link to voting portal\n\n` +
            `📊 You can track email delivery status in the session progress view.`
          );
        } else {
          alert(result.message || 'Failed to send invites');
        }
      } catch (error) {
        console.error('Error sending invites:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  // Function to handle edit session
  const handleEditSession = (session) => {
    // Prevent editing if session is completed
    if (session.status === 'completed') {
      alert('Cannot edit a completed voting session.');
      return;
    }
    
    setSelectedSessionForEdit(session);
    setEditForm({
      title: session.title,
      description: session.description,
      startDate: session.startTime.split('T')[0],
      startTime: session.startTime.split('T')[1]?.substring(0, 5) || '',
      endTime: session.endTime.split('T')[1]?.substring(0, 5) || '',
      position: session.position || '',
      candidates: session.candidates.length > 0 
        ? session.candidates.map(c => ({ fullName: c.name }))
        : [{ fullName: '' }]
    });
    setIsEditModalOpen(true);
  };

  // Function to handle view session
  const handleViewSession = (session) => {
    setSelectedSessionForView(session);
    setIsViewModalOpen(true);
  };

  // Function to update session
  const handleUpdateSession = async (e) => {
    e.preventDefault();
    
    if (!editForm.title || !editForm.description || !editForm.startDate || !editForm.position) {
      alert('Please fill in all required fields');
      return;
    }

    if (editForm.candidates.some(c => !c.fullName)) {
      alert('Please fill in all candidate names');
      return;
    }

    try {
      const sessionData = {
        id: selectedSessionForEdit.id,
        title: editForm.title,
        description: editForm.description,
        startTime: editForm.startTime || '09:00:00',
        endTime: editForm.endTime || '17:00:00',
        votingDate: editForm.startDate,
        candidates: editForm.candidates.filter(c => c.fullName).map(c => ({
          fullName: c.fullName,
          position: editForm.position
        }))
      };

      const response = await makeAuthenticatedRequest(`/VotingSession/Update/${selectedSessionForEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();

      if (result.status) {
        alert('Voting session updated successfully!');
        handleCloseEditModal();
        // Reload sessions
        loadVotingSessions();
      } else {
        alert(result.message || 'Failed to update session');
      }
    } catch (error) {
      console.error('Error updating voting session:', error);
      alert('Network error. Please try again.');
    }
  };

  // Redirect if not authenticated or not an organization
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role?.toLowerCase() !== 'organization')) {
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, isLoading, user]);

  // Fetch data when component mounts
  React.useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === 'organization') {
      loadVotingSessions();
    }
  }, [isAuthenticated, user, loadVotingSessions]);

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
  if (!isAuthenticated || user?.role?.toLowerCase() !== 'organization') {
    return null;
  }

  // Helper functions for styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 70) return 'from-green-500 to-green-600';
    if (percentage >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const ProgressModal = () => {
    const session = votingSessions.find(s => s.id === selectedSessionForProgress);
    if (!session) return null;

    return (
      <AnimatePresence>
        {isProgressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsProgressModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{session.title}</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Real-time Voting Progress</p>
                </div>
                <button
                  onClick={() => setIsProgressModalOpen(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <i className="ri-close-line text-gray-600 text-lg sm:text-xl"></i>
                </button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm">Total Voters</p>
                      <p className="text-lg sm:text-2xl font-bold">{session.votersCount.toLocaleString()}</p>
                    </div>
                    <i className="ri-group-line text-2xl sm:text-3xl text-blue-200"></i>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs sm:text-sm">Votes Cast</p>
                      <p className="text-lg sm:text-2xl font-bold">{session.votedCount.toLocaleString()}</p>
                    </div>
                    <i className="ri-checkbox-circle-line text-2xl sm:text-3xl text-green-200"></i>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs sm:text-sm">Turnout Rate</p>
                      <p className="text-lg sm:text-2xl font-bold">{session.turnoutRate}%</p>
                    </div>
                    <i className="ri-pie-chart-line text-2xl sm:text-3xl text-purple-200"></i>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-xs sm:text-sm">Remaining</p>
                      <p className="text-lg sm:text-2xl font-bold">{(session.votersCount - session.votedCount).toLocaleString()}</p>
                    </div>
                    <i className="ri-hourglass-line text-2xl sm:text-3xl text-orange-200"></i>
                  </div>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Overall Voting Progress</h3>
                  <span className="text-xs sm:text-sm text-gray-600">{session.votedCount} / {session.votersCount} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                  <motion.div
                    className={`h-3 sm:h-4 rounded-full bg-gradient-to-r ${getProgressColor(session.turnoutRate)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${session.turnoutRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-right text-xs sm:text-sm text-gray-600 mt-1">{session.turnoutRate}% turnout</p>
              </div>

              {/* Candidates Results */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Live Results by Candidate</h3>
                <div className="space-y-3 sm:space-y-4">
                  {session.candidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 ${getCandidateDotColor(index)}`}></div>
                          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{candidate.name}</span>
                        </div>
                        <div className="text-right ml-4">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">{candidate.votes.toLocaleString()} votes</span>
                          <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">({candidate.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <motion.div
                          className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${getCandidateColor(index)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.percentage}%` }}
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
                  Refresh page for latest updates
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Edit Modal Component - memoized to prevent unnecessary rerenders
  const EditModal = React.memo(() => {
    if (!selectedSessionForEdit) return null;

    return (
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseEditModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Edit Voting Session</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Update session details and candidates</p>
                </div>
                <button
                  onClick={handleCloseEditModal}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <i className="ri-close-line text-gray-600 text-lg sm:text-xl"></i>
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleUpdateSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleEditFormChange('title', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    placeholder="Enter session title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => handleEditFormChange('description', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    placeholder="Enter session description"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voting Date *</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => handleEditFormChange('startDate', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={editForm.startTime}
                      onChange={(e) => handleEditFormChange('startTime', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={editForm.endTime}
                      onChange={(e) => handleEditFormChange('endTime', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Position Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => handleEditFormChange('position', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    placeholder="e.g., President, Mayor, Class Representative"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This position will apply to all candidates in this voting session</p>
                </div>

                {/* Candidates Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Candidates *</label>
                  {editForm.candidates.map((candidate, index) => (
                    <div key={`edit-candidate-${index}`} className="flex gap-2 sm:gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={candidate.fullName}
                        onChange={(e) => handleEditCandidateChange(index, 'fullName', e.target.value)}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                      />
                      {editForm.candidates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEditCandidate(index)}
                          className="px-2 sm:px-3 py-2 sm:py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEditCandidate}
                    className="mt-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <i className="ri-add-line mr-1"></i>
                    Add Candidate
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  >
                    <i className="ri-save-line mr-2"></i>
                    Update Session
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  });

  // View Modal Component
  const ViewModal = () => {
    if (!selectedSessionForView) return null;

    return (
      <AnimatePresence>
        {isViewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSessionForView.title}</h2>
                  <p className="text-gray-600">Session Details</p>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>

              {/* Session Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedSessionForView.description}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedSessionForView.status)}`}>
                      {selectedSessionForView.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">Voting Date</h3>
                    <p className="text-blue-700">{new Date(selectedSessionForView.startTime).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-green-900 mb-2">Start Time</h3>
                    <p className="text-green-700">{new Date(selectedSessionForView.startTime).toLocaleTimeString()}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-orange-900 mb-2">End Time</h3>
                    <p className="text-orange-700">{new Date(selectedSessionForView.endTime).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-purple-900 mb-3">Candidates</h3>
                  <div className="space-y-2">
                    {selectedSessionForView.candidates.map((candidate, index) => (
                      <div key={candidate.name} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${getCandidateDotColor(index)}`}></div>
                        <span className="text-purple-700 font-medium">{candidate.name}</span>
                        {(selectedSessionForView.status === 'active' || selectedSessionForView.status === 'completed') && (
                          <span className="ml-auto text-sm text-purple-600">
                            {candidate.votes} votes ({candidate.percentage}%)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Voter Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Voters</p>
                      <p className="text-xl font-bold text-gray-900">{selectedSessionForView.votersCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Votes Cast</p>
                      <p className="text-xl font-bold text-gray-900">{selectedSessionForView.votedCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 sm:top-20 left-5 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-blue-200/20 rounded-full blur-xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-32 h-32 sm:w-40 sm:h-40 bg-purple-200/20 rounded-full blur-xl"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base hidden sm:block">Manage voting sessions and voters</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
              <div className="bg-blue-100 text-blue-800 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                <i className="ri-admin-line mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">{user?.email || 'Administrator'}</span>
                <span className="sm:hidden">Admin</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                title="Logout"
              >
                <i className="ri-logout-box-line text-lg sm:text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 sm:space-y-12"
        >
          {/* Voting Sessions Section - Now First */}
          <motion.section 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <i className="ri-list-check-line text-white text-lg sm:text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Voting Sessions</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Monitor all active and upcoming voting sessions</p>
                </div>
              </div>
              <button
                onClick={loadVotingSessions}
                className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm self-start sm:self-auto"
                disabled={isLoadingData}
              >
                <i className={`ri-refresh-line mr-1 ${isLoadingData ? 'animate-spin' : ''}`}></i>
                Refresh
              </button>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <i className="ri-error-warning-line mr-2"></i>
                {apiError}
              </div>
            )}

            {/* Loading State */}
            {isLoadingData && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading voting sessions...</p>
              </div>
            )}

            {/* No Sessions State */}
            {!isLoadingData && votingSessions.length === 0 && !apiError && (
              <div className="text-center py-8">
                <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600 mb-2">No voting sessions found</p>
                <p className="text-sm text-gray-500">Create your first voting session below to get started</p>
              </div>
            )}

            {/* Sessions Grid */}
            {!isLoadingData && votingSessions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {votingSessions.map((session, sessionIndex) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sessionIndex * 0.1 }}
                    className="p-4 sm:p-6 bg-white/60 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg flex-1 mr-2">{session.title}</h3>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{session.description}</p>
                    
                    {/* Progress Bar for Active/Completed Sessions */}
                    {(session.status === 'active' || session.status === 'completed') && session.votersCount > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Voting Progress</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            {session.votedCount} / {session.votersCount} ({session.turnoutRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-3">
                          <motion.div
                            className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${getProgressColor(session.turnoutRate)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${session.turnoutRate}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        
                        {/* Candidate Progress Bars */}
                        {session.candidates.length > 0 && (
                          <div className="space-y-2">
                            {session.candidates.slice(0, 3).map((candidate, index) => (
                              <div key={candidate.name} className="flex items-center">
                                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 ${getCandidateDotColor(index)}`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-700 font-medium truncate pr-2">{candidate.name}</span>
                                    <span className="text-xs text-gray-600 whitespace-nowrap">{candidate.percentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                                    <motion.div
                                      className={`h-1 sm:h-1.5 rounded-full bg-gradient-to-r ${getCandidateColor(index)}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${candidate.percentage}%` }}
                                      transition={{ duration: 1.2, delay: (sessionIndex * 0.1) + (index * 0.2), ease: "easeOut" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Leading Candidate for Active/Completed Sessions */}
                    {(session.status === 'active' || session.status === 'completed') && session.candidates.length > 0 && (
                      <div className="mb-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <i className="ri-trophy-line text-yellow-600 mr-1 sm:mr-2 text-sm"></i>
                            <span className="text-xs sm:text-sm text-gray-800 font-medium">Leading:</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-semibold text-gray-900">{session.candidates[0]?.name || 'N/A'}</span>
                            <span className="text-xs text-gray-700 ml-1">({session.candidates[0]?.percentage || 0}%)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-4">
                      <span>
                        <i className="ri-group-line mr-1"></i>
                        {session.votersCount} voters
                      </span>
                      <span>
                        <i className="ri-calendar-line mr-1"></i>
                        {new Date(session.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* First Row - Edit and Progress/View */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditSession(session)}
                          disabled={session.status === 'completed'}
                          className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            session.status === 'completed' 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          <i className="ri-edit-line mr-1"></i>
                          Edit
                        </button>
                        {(session.status === 'active' || session.status === 'completed') && (
                          <button 
                            onClick={() => {
                              setSelectedSessionForProgress(session.id);
                              setIsProgressModalOpen(true);
                            }}
                            className="flex-1 bg-green-100 text-green-700 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <i className="ri-bar-chart-line mr-1"></i>
                            Progress
                          </button>
                        )}
                        {session.status === 'upcoming' && (
                          <button 
                            onClick={() => handleViewSession(session)}
                            className="flex-1 bg-green-100 text-green-700 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <i className="ri-eye-line mr-1"></i>
                            View
                          </button>
                        )}
                      </div>
                      
                      {/* Second Row - Upload CSV and Send Invites */}
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleUploadCsvToSession(session.id)}
                          disabled={uploadingSessionId === session.id || session.status === 'completed'}
                          className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                            uploadingSessionId === session.id
                              ? 'bg-purple-200 text-purple-600 cursor-not-allowed'
                              : session.status === 'completed'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          {uploadingSessionId === session.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-600 mr-1 inline-block"></div>
                              <span className="hidden sm:inline">Uploading...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <i className="ri-upload-cloud-line mr-1"></i>
                              <span className="hidden sm:inline">Upload CSV</span>
                              <span className="sm:hidden">Upload</span>
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSendInvites(session.id)}
                          disabled={session.votersCount === 0}
                          className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                            session.votersCount === 0 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          <i className="ri-mail-send-line mr-1"></i>
                          <span className="hidden sm:inline">Send Invites</span>
                          <span className="sm:hidden">Invites</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Create Voting Session - Now Second */}
          <motion.section 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i className="ri-add-circle-line text-white text-lg sm:text-xl"></i>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create Voting Session</h2>
                <p className="text-xs sm:text-sm text-gray-600">Create a new voting session with candidates</p>
              </div>
            </div>
            
            <div onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => handleSessionFormChange('title', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Enter session title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  rows={3}
                  value={sessionForm.description}
                  onChange={(e) => handleSessionFormChange('description', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Enter session description"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voting Date *</label>
                  <input
                    type="date"
                    value={sessionForm.startDate}
                    onChange={(e) => handleSessionFormChange('startDate', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={sessionForm.startTime}
                    onChange={(e) => handleSessionFormChange('startTime', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={sessionForm.endTime}
                    onChange={(e) => handleSessionFormChange('endTime', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Position Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                <input
                  type="text"
                  value={sessionForm.position}
                  onChange={(e) => handleSessionFormChange('position', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                  placeholder="e.g., President, Mayor, Class Representative"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This position will apply to all candidates in this voting session</p>
              </div>

              {/* Candidates Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Candidates *</label>
                {sessionForm.candidates.map((candidate, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={candidate.fullName}
                      onChange={(e) => handleCandidateChange(index, 'fullName', e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    />
                    {sessionForm.candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        className="px-2 sm:px-3 py-2 sm:py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCandidate}
                  className="mt-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <i className="ri-add-line mr-1"></i>
                  Add Candidate
                </button>
              </div>
              
              <motion.button
                type="button"
                onClick={handleCreateSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                <i className="ri-add-line mr-2"></i>
                Create Session
              </motion.button>
            </div>
          </motion.section>
        </motion.div>
      </main>

      {/* Progress Modal */}
      <ProgressModal />
      
      {/* Edit Modal */}
      <EditModal />
      
      {/* View Modal */}
      <ViewModal />
    </div>
  );
};

export default AdminDashboard;