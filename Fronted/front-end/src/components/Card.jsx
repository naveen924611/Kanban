

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateCard, deleteCard } from '../services/api';
import './Card.css';

function Card({ card, onClick }) {
  const [isCompleted, setIsCompleted] = useState(card.isCompleted || false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    try {
      await updateCard(card._id, { isCompleted: newStatus });
    } catch (error) {
      console.error('Error updating card:', error);
      setIsCompleted(!newStatus); // revert on error
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete card "${card.title}"?`)) {
      try {
        await deleteCard(card._id);
      } catch (error) {
        console.error('Error deleting card:', error);
        alert('Failed to delete card');
      }
    }
  };

  const handleCardClick = (e) => {
    if (e.target.type === 'checkbox' || e.target.closest('.delete-card-btn')) {
      return;
    }
    onClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card ${isCompleted ? 'completed' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <div className="card-left">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggleComplete}
            className="card-checkbox"
            title="Mark as complete"
          />
          <h4>{card.title}</h4>
        </div>
        <button onClick={handleDelete} className="delete-card-btn" title="Delete card">
          🗑️
        </button>
      </div>

      {card.labels && card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map((label, index) => (
            <span key={index} className="label">{label}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        {card.dueDate && (
          <span className={`due-date ${isOverdue(card.dueDate) ? 'overdue' : ''}`}>
            📅 {formatDate(card.dueDate)}
          </span>
        )}

        {card.assignees && card.assignees.length > 0 && (
          <div className="card-assignees">
            {card.assignees.slice(0, 2).map(assignee => (
              <img
                key={assignee._id}
                src={assignee.avatar}
                alt={assignee.name}
                className="assignee-avatar"
                title={assignee.name}
              />
            ))}
            {card.assignees.length > 2 && (
              <span className="more-assignees">+{card.assignees.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
