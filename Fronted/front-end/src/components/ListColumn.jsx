

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from './Card';
import './ListColumn.css';

function ListColumn({ list, cards, onCreateCard, onCardClick, onDeleteList }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  
  const { setNodeRef } = useDroppable({
    id: list._id,
  });

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    
    onCreateCard(list._id, newCardTitle);
    setNewCardTitle('');
    setShowAddCard(false);
  };

  const handleDeleteList = () => {
    if (window.confirm(`Delete list "${list.title}"? All cards in this list will be deleted.`)) {
      onDeleteList(list._id);
    }
    setShowMenu(false);
  };
  

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div className="list-column" ref={setNodeRef}>
      <div className="list-header">
        <h3>{list.title}</h3>
        <div className="list-actions">
          <span className="card-count">{cards.length}</span>
          <button 
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋯
          </button>
          {showMenu && (
            <div className="list-menu">
              <button onClick={handleDeleteList} className="delete-list-btn">
                🗑️ Delete List
              </button>
            </div>
          )}
        </div>
      </div>

      <SortableContext
        items={sortedCards.map(c => c._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="cards-container">
          {sortedCards.map(card => (
            <Card
              key={card._id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </SortableContext>

      {showAddCard ? (
        <form onSubmit={handleAddCard} className="add-card-form">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            autoFocus
            rows={2}
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary-sm">Add</button>
            <button 
              type="button" 
              onClick={() => {
                setShowAddCard(false);
                setNewCardTitle('');
              }}
              className="btn-cancel"
            >
              ✕
            </button>
          </div>
        </form>
      ) : (
        <button 
          className="add-card-btn"
          onClick={() => setShowAddCard(true)}
        >
          + Add Card
        </button>
      )}
    </div>
  );
}

export default ListColumn;