import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { addBoardMember } from '../services/api';
import axios from 'axios';
import './BoardSettings.css';

function BoardSettings({ board, onClose, onUpdate }) {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwner = board.owner?._id === user?.id || board.owner === user?.id;

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim()) {
      setError('Please enter an email');
      return;
    }

    setLoading(true);

    try {
      // First, find user by email
      const userRes = await axios.get(`/api/auth/user-by-email?email=${email}`);
      const inviteUserId = userRes.data.id;

      // Check if already a member
      const isMember = board.members.some(m => m._id === inviteUserId || m === inviteUserId);
      if (isMember) {
        setError('User is already a board member');
        setLoading(false);
        return;
      }

      // Add member to board
      await addBoardMember(board._id, inviteUserId);
      
      setSuccess(`${email} added to board!`);
      setEmail('');
      
      // Refresh board data
      setTimeout(() => {
        onUpdate();
        setSuccess('');
      }, 2000);

    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found with this email');
      } else {
        setError('Failed to invite user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/board/${board._id}`;
    navigator.clipboard.writeText(link);
    setSuccess('Board link copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="board-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Board Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          {/* Board Info */}
          <div className="settings-section">
            <h3>Board Information</h3>
            <p><strong>Title:</strong> {board.title}</p>
            <p><strong>Visibility:</strong> {board.visibility}</p>
            <p><strong>Owner:</strong> {board.owner?.name || 'You'}</p>
          </div>

          {/* Share Link */}
          <div className="settings-section">
            <h3>Share Board</h3>
            <div className="share-link-container">
              <input 
                type="text" 
                value={`${window.location.origin}/board/${board._id}`}
                readOnly
                className="share-link-input"
              />
              <button onClick={handleCopyLink} className="btn-copy">
                📋 Copy Link
              </button>
            </div>
            <p className="share-note">Anyone with this link and an account can join if invited</p>
          </div>

          {/* Invite Members (Owner Only) */}
          {isOwner && (
            <div className="settings-section">
              <h3>Invite Members</h3>
              <form onSubmit={handleInvite} className="invite-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter user email"
                  disabled={loading}
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Inviting...' : 'Invite'}
                </button>
              </form>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
            </div>
          )}

          {/* Current Members */}
          <div className="settings-section">
            <h3>Members ({board.members?.length || 0})</h3>
            <div className="members-list">
              {board.members?.map(member => (
                <div key={member._id} className="member-item">
                  <img src={member.avatar} alt={member.name} className="member-avatar" />
                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                  </div>
                  {member._id === board.owner?._id && (
                    <span className="owner-badge">Owner</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardSettings;