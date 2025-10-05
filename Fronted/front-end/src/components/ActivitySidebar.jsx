import React, { useState, useEffect } from 'react';
import { getActivities } from '../services/api';
import './ActivitySidebar.css';

function ActivitySidebar({ boardId, onClose }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, [boardId]);

  const fetchActivities = async () => {
    try {
      const res = await getActivities(boardId);
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityMessage = (activity) => {
    const actor = activity.actor?.name || 'Someone';
    
    switch (activity.action) {
      case 'board_created':
        return `${actor} created this board`;
      case 'card_created':
        return `${actor} added "${activity.metadata?.cardTitle}"`;
      case 'card_moved':
        return `${actor} moved "${activity.metadata?.cardTitle}"`;
      case 'card_updated':
        return `${actor} updated "${activity.metadata?.cardTitle}"`;
      case 'card_deleted':
        return `${actor} deleted "${activity.metadata?.cardTitle}"`;
      case 'comment_added':
        return `${actor} commented on "${activity.metadata?.cardTitle}"`;
      case 'list_created':
        return `${actor} added list "${activity.metadata?.title}"`;
      case 'list_deleted':
        return `${actor} deleted list "${activity.metadata?.title}"`;
      default:
        return `${actor} performed an action`;
    }
  };

  return (
    <div className="activity-sidebar">
      <div className="sidebar-header">
        <h3>Activity</h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>
      
      <div className="activities-list">
        {activities.map(activity => (
          <div key={activity._id} className="activity-item">
            <img 
              src={activity.actor?.avatar} 
              alt={activity.actor?.name}
              className="activity-avatar"
            />
            <div className="activity-content">
              <p>{getActivityMessage(activity)}</p>
              <span className="activity-time">{formatTime(activity.createdAt)}</span>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <p className="no-activities">No activities yet</p>
        )}
      </div>
    </div>
  );
}

export default ActivitySidebar;