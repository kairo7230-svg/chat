import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchFriends,
  fetchFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  fetchChats,
  sendMessage,
  clearAuth
} from '../utils/api.js';

function Dashboard() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chats, setChats] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch friends list and pending requests
  const loadInitialData = async () => {
    try {
      const friendsRes = await fetchFriends();
      if (friendsRes.status === 401 || friendsRes.status === 403) {
        handleLogout();
        return;
      }
      const friendsData = await friendsRes.json();
      if (friendsRes.ok && friendsData.success) {
        setFriends(friendsData.friends || []);
      }

      const reqsRes = await fetchFriendRequests();
      const reqsData = await reqsRes.json();
      if (reqsRes.ok && reqsData.success) {
        setRequests(reqsData.requests || []);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // Poll the list for incoming requests or new friends every 5 seconds
    const listInterval = setInterval(loadInitialData, 5000);
    return () => clearInterval(listInterval);
  }, []);

  // Poll chats when a friend is selected
  useEffect(() => {
    if (!selectedFriend) {
      setChats([]);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const loadChats = async () => {
      try {
        const res = await fetchChats(selectedFriend.id);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setChats(data.chatHistory || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };

    // Immediate load
    loadChats();

    // Start polling
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(loadChats, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [selectedFriend]);

  // Scroll to bottom when chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!searchEmail || !searchEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    setSendingRequest(true);
    try {
      const res = await sendFriendRequest(searchEmail.trim());
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Friend request sent successfully.');
        setSearchEmail('');
        loadInitialData();
      } else {
        toast.error(data.message || 'Unable to send friend request.');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      const res = await acceptFriendRequest(senderId);
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Friend request accepted!');
        loadInitialData();
      } else {
        toast.error(data.message || 'Failed to accept request.');
      }
    } catch (error) {
      toast.error('Error accepting friend request.');
    }
  };

  const handleDeclineRequest = async (senderId) => {
    try {
      const res = await declineFriendRequest(senderId);
      const data = await res.json();
      if (res.ok && data.success) {
        toast.info('Friend request declined.');
        loadInitialData();
      } else {
        toast.error(data.message || 'Failed to decline request.');
      }
    } catch (error) {
      toast.error('Error declining friend request.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText || !newMessageText.trim() || !selectedFriend) return;

    const msg = newMessageText.trim();
    setNewMessageText('');

    try {
      const res = await sendMessage(selectedFriend.id, msg);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Immediately update state to be snappy
          setChats(prev => [...prev, data.message]);
        }
      } else {
        const data = await res.json();
        toast.error(data.message || 'Could not send message.');
      }
    } catch (error) {
      toast.error('Error sending message. Try again.');
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  // Format timestamp nicely
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Sidebar Panel */}
      <div style={styles.sidebar}>
        {/* User Info Header */}
        <div style={styles.userProfile}>
          <div style={styles.avatarLarge}>
            {getInitials(userName)}
          </div>
          <div style={styles.profileDetails}>
            <div style={styles.profileName}>{userName}</div>
            <div style={styles.profileStatus}>Online</div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <svg style={styles.logoutIcon} viewBox="0 0 24 24">
              <path fill="currentColor" d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9Z"/>
            </svg>
          </button>
        </div>

        {/* Add Friend Search Box */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>Add New Friend</div>
          <form onSubmit={handleSendRequest} style={styles.searchForm}>
            <input
              type="email"
              placeholder="friend@email.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              style={styles.searchInput}
              required
            />
            <button type="submit" style={styles.searchBtn} disabled={sendingRequest}>
              {sendingRequest ? '...' : '+'}
            </button>
          </form>
        </div>

        {/* Friend Requests Section */}
        {requests.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>Friend Requests ({requests.length})</div>
            <div style={styles.requestList}>
              {requests.map((req) => (
                <div key={req.id} style={styles.requestItem}>
                  <div style={styles.requestUserInfo}>
                    <span style={styles.requestName}>{req.name}</span>
                    <span style={styles.requestEmail}>{req.email}</span>
                  </div>
                  <div style={styles.requestActions}>
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      style={styles.acceptBtn}
                      title="Accept"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      style={styles.declineBtn}
                      title="Decline"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List Section */}
        <div style={styles.friendsSection}>
          <div style={styles.sectionHeader}>Friends</div>
          {loading ? (
            <div style={styles.infoText}>Loading friends...</div>
          ) : friends.length === 0 ? (
            <div style={styles.infoText}>No friends added yet. Send a request to get started!</div>
          ) : (
            <div style={styles.friendsList}>
              {friends.map((friend) => {
                const isSelected = selectedFriend?.id === friend.id;
                return (
                  <div
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    style={{
                      ...styles.friendItem,
                      ...(isSelected ? styles.friendItemActive : {})
                    }}
                  >
                    <div style={{
                      ...styles.avatarSmall,
                      ...(isSelected ? styles.avatarSmallActive : {})
                    }}>
                      {getInitials(friend.name)}
                    </div>
                    <div style={styles.friendDetails}>
                      <div style={{
                        ...styles.friendName,
                        ...(isSelected ? styles.friendNameActive : {})
                      }}>{friend.name}</div>
                      <div style={{
                        ...styles.friendEmail,
                        ...(isSelected ? styles.friendEmailActive : {})
                      }}>{friend.email}</div>
                    </div>
                    <div style={styles.onlineIndicator} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window Panel */}
      <div style={styles.chatWindow}>
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.avatarSmall}>
                {getInitials(selectedFriend.name)}
              </div>
              <div style={styles.chatHeaderDetails}>
                <div style={styles.chatFriendName}>{selectedFriend.name}</div>
                <div style={styles.chatFriendEmail}>{selectedFriend.email}</div>
              </div>
              <div style={styles.headerStatus}>
                <span style={styles.statusDot} /> Active Session
              </div>
            </div>

            {/* Chat Messages */}
            <div style={styles.chatMessagesContainer}>
              {chats.length === 0 ? (
                <div style={styles.emptyChatPlaceholder}>
                  <div style={styles.placeholderIcon}>💬</div>
                  <div>No messages yet. Say hello to {selectedFriend.name}!</div>
                </div>
              ) : (
                chats.map((msg, index) => {
                  const isMe = msg.sender === selectedFriend.id ? false : true;
                  return (
                    <div
                      key={index}
                      style={{
                        ...styles.messageRow,
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(isMe ? styles.messageBubbleMe : styles.messageBubbleFriend)
                        }}
                      >
                        <div style={styles.messageText}>{msg.message}</div>
                        <div style={{
                          ...styles.messageTime,
                          color: isMe ? 'rgba(255,255,255,0.7)' : '#9ca3af'
                        }}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <form onSubmit={handleSendMessage} style={styles.chatInputForm}>
              <input
                type="text"
                placeholder="Type your message here..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                style={styles.chatInput}
                required
              />
              <button type="submit" style={styles.sendBtn}>
                Send
              </button>
            </form>
          </>
        ) : (
          /* Welcome Screen when no friend is selected */
          <div style={styles.welcomeContainer}>
            <div style={styles.welcomeCard}>
              <div style={styles.welcomeIllustration}>💬</div>
              <h1 style={styles.welcomeTitle}>Connect with Friends</h1>
              <p style={styles.welcomeSubtitle}>
                Add your friends by email, accept requests, and start chatting securely in real-time.
              </p>
              <div style={styles.welcomeSteps}>
                <div style={styles.welcomeStep}>1. Search a friend's email above</div>
                <div style={styles.welcomeStep}>2. Accept pending incoming requests</div>
                <div style={styles.welcomeStep}>3. Select a friend to load your chat history</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    fontFamily: 'Outfit, Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  },
  sidebar: {
    width: '360px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(15, 23, 42, 0.02)'
  },
  userProfile: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#ffffff'
  },
  avatarLarge: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.2rem',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
  },
  profileDetails: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  profileName: {
    fontWeight: '700',
    fontSize: '1.05rem',
    color: '#1e293b'
  },
  profileStatus: {
    fontSize: '0.8rem',
    color: '#10b981',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.1rem'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutIcon: {
    width: '22px',
    height: '22px'
  },
  sectionCard: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9'
  },
  sectionHeader: {
    fontSize: '0.85rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem'
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem'
  },
  searchInput: {
    flexGrow: 1,
    padding: '0.65rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  searchBtn: {
    padding: '0 1rem',
    backgroundColor: '#4338ca',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.2rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  requestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '160px',
    overflowY: 'auto'
  },
  requestItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0.8rem',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  requestUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  requestName: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  requestEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  requestActions: {
    display: 'flex',
    gap: '0.35rem'
  },
  acceptBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    width: '26px',
    height: '26px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  },
  declineBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    width: '26px',
    height: '26px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  },
  friendsSection: {
    padding: '1.25rem 1.5rem',
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  friendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  friendItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    position: 'relative'
  },
  friendItemActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#e0e7ff'
  },
  avatarSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.95rem'
  },
  avatarSmallActive: {
    backgroundColor: '#4338ca',
    color: '#ffffff'
  },
  friendDetails: {
    marginLeft: '0.75rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  friendName: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#334155',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  friendNameActive: {
    color: '#4338ca'
  },
  friendEmail: {
    fontSize: '0.8rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '0.05rem'
  },
  friendEmailActive: {
    color: '#6366f1'
  },
  onlineIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    position: 'absolute',
    right: '1.25rem',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  infoText: {
    fontSize: '0.85rem',
    color: '#64748b',
    textAlign: 'center',
    padding: '2rem 1rem',
    lineHeight: '1.5'
  },
  chatWindow: {
    flexGrow: 1,
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  chatHeader: {
    padding: '1rem 1.5rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  chatHeaderDetails: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  chatFriendName: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#1e293b'
  },
  chatFriendEmail: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.1rem'
  },
  headerStatus: {
    fontSize: '0.8rem',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  chatMessagesContainer: {
    flexGrow: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  emptyChatPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: '0.95rem'
  },
  placeholderIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '0.75rem 1rem',
    borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  messageBubbleMe: {
    background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
    color: '#ffffff',
    borderBottomRightRadius: '4px'
  },
  messageBubbleFriend: {
    backgroundColor: '#ffffff',
    color: '#1e293b',
    borderBottomLeftRadius: '4px',
    border: '1px solid #e2e8f0'
  },
  messageText: {
    fontSize: '0.95rem',
    lineHeight: '1.45',
    wordBreak: 'break-word'
  },
  messageTime: {
    fontSize: '0.7rem',
    alignSelf: 'flex-end',
    marginTop: '0.1rem'
  },
  chatInputForm: {
    padding: '1.25rem 1.5rem',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '0.75rem'
  },
  chatInput: {
    flexGrow: 1,
    padding: '0.8rem 1.2rem',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  sendBtn: {
    padding: '0 1.5rem',
    backgroundColor: '#4338ca',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  welcomeContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '2rem'
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    padding: '3rem 2.5rem',
    borderRadius: '24px',
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
    maxWidth: '500px',
    textAlign: 'center',
    border: '1px solid #e2e8f0'
  },
  welcomeIllustration: {
    fontSize: '4.5rem',
    marginBottom: '1.5rem'
  },
  welcomeTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 0.75rem'
  },
  welcomeSubtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    margin: '0 0 2rem'
  },
  welcomeSteps: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1.25rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0'
  },
  welcomeStep: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569'
  }
};

export default Dashboard;
