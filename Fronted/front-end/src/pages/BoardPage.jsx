
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getBoard, createList, createCard, updateCard, updateList, deleteList } from '../services/api';
import io from 'socket.io-client';
import ListColumn from '../components/ListColumn';
import CardModal from '../components/CardModal';
import ActivitySidebar from '../components/ActivitySidebar';
import SearchBar from '../components/SearchBar';
import BoardSettings from '../components/BoardSettings';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import './BoardPage.css';

let socket;

function BoardPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showActivitySidebar, setShowActivitySidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [showNewList, setShowNewList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchBoard();
    
    // Setup socket
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL);
    socket.emit('join-board', id);
    
    // Listen for real-time updates
    socket.on('card-created', (newCard) => {
      setCards(prev => [...prev, newCard]);
    });
    
    socket.on('card-updated', (updatedCard) => {
      setCards(prev => prev.map(c => c._id === updatedCard._id ? updatedCard : c));
    });
    
    socket.on('card-deleted', ({ cardId }) => {
      setCards(prev => prev.filter(c => c._id !== cardId));
    });
    
    socket.on('list-created', (newList) => {
      setLists(prev => [...prev, newList]);
    });
    
    socket.on('list-updated', (updatedList) => {
      setLists(prev => prev.map(l => l._id === updatedList._id ? updatedList : l));
    });
    
    socket.on('comment-added', () => {
      // Refresh card if modal is open
      if (selectedCard) {
        // Will be handled in CardModal component
      }
    });
    
    return () => {
      socket.emit('leave-board', id);
      socket.disconnect();
    };
  }, [id]);

  const fetchBoard = async () => {
    try {
      const res = await getBoard(id);
      setBoard(res.data);
      setLists(res.data.lists || []);
      setCards(res.data.cards || []);
    } catch (error) {
      console.error('Error fetching board:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    try {
      await createList({
        title: newListTitle,
        board: id
      });
      setNewListTitle('');
      setShowNewList(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleCreateCard = async (listId, title) => {
    try {
      await createCard({
        title,
        list: listId,
        board: id
      });
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find(c => c._id === active.id);
    setActiveCard(card);
  };
     const handleDeleteList = async (listId) => {
  try {
    await deleteList(listId);

    setLists(prev => prev.filter(l => l._id !== listId));
    setCards(prev => prev.filter(c => c.list !== listId));
  } catch (error) {
    console.error('Error deleting list:', error);
    alert('Failed to delete list');
  }
};
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCard(null);
      return;
    }
    
    const activeCard = cards.find(c => c._id === active.id);
    const overCard = cards.find(c => c._id === over.id);
    
    if (!activeCard) {
      setActiveCard(null);
      return;
    }
    
    // Check if dropped on a list
    const overList = lists.find(l => l._id === over.id);
    
    if (overList) {
      // Moving to empty list or top of list
      const newListId = overList._id;
      if (activeCard.list !== newListId) {
        // Optimistic update
        setCards(prev => prev.map(c => 
          c._id === activeCard._id 
            ? { ...c, list: newListId, position: 1024 }
            : c
        ));
        
        // API call
        try {
          await updateCard(activeCard._id, {
            list: newListId,
            position: 1024
          });
        } catch (error) {
          console.error('Error moving card:', error);
          fetchBoard(); // Revert on error
        }
      }
    } else if (overCard) {
      // Dropped on another card
      const newListId = overCard.list;
      const cardsInList = cards.filter(c => c.list === newListId).sort((a, b) => a.position - b.position);
      const overIndex = cardsInList.findIndex(c => c._id === overCard._id);
      
      // Calculate new position
      let newPosition;
      if (overIndex === 0) {
        newPosition = cardsInList[0].position / 2;
      } else if (overIndex === cardsInList.length - 1) {
        newPosition = cardsInList[overIndex].position + 1024;
      } else {
        newPosition = (cardsInList[overIndex].position + cardsInList[overIndex + 1].position) / 2;
      }
      
      // Optimistic update
      setCards(prev => prev.map(c => 
        c._id === activeCard._id 
          ? { ...c, list: newListId, position: newPosition }
          : c
      ));
      
      // API call
      try {
        await updateCard(activeCard._id, {
          list: newListId,
          position: newPosition
        });
      } catch (error) {
        console.error('Error moving card:', error);
        fetchBoard();
      }
    }
    
    setActiveCard(null);
  };

  const handleSearch = (filteredCards) => {
    // This will be used to filter displayed cards
    console.log('Filtered cards:', filteredCards);
  };

  if (!board) {
    return <div className="loading">Loading board...</div>;
  }

  return (
    <div className="board-page">
      <nav className="board-navbar">
        <div className="nav-left">
          <button onClick={() => navigate('/')} className="btn-back">← Back</button>
          <h2>{board.title}</h2>
        </div>
        <div className="nav-center">
          <SearchBar boardId={id} onSearch={handleSearch} />
        </div>
        <div className="nav-right">
          <button 
            onClick={() => setShowSettings(true)}
            className="btn-secondary"
          >
            ⚙️ Settings
          </button>
          <button 
            onClick={() => setShowActivitySidebar(!showActivitySidebar)}
            className="btn-secondary"
          >
            Activity
          </button>
          <span className="user-info">
            <img src={user?.avatar} alt={user?.name} className="user-avatar-small" />
          </span>
        </div>
      </nav>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-content">
          <div className="lists-container">
            <SortableContext
              items={lists.map(l => l._id)}
              strategy={horizontalListSortingStrategy}
            >
            {lists.map(list => (
  <ListColumn
    key={list._id}
    list={list}
    cards={cards.filter(c => c.list === list._id)}
    onCreateCard={handleCreateCard}
    onCardClick={setSelectedCard}
    onDeleteList={handleDeleteList}  // Add this line
  />
))}
            </SortableContext>

            {/* Add new list */}
            {showNewList ? (
              <div className="new-list-form">
                <form onSubmit={handleCreateList}>
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    autoFocus
                  />
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Add</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowNewList(false);
                        setNewListTitle('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button 
                className="add-list-btn"
                onClick={() => setShowNewList(true)}
              >
                + Add List
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="card dragging">
              <h4>{activeCard.title}</h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={fetchBoard}
        />
      )}

      {showActivitySidebar && (
        <ActivitySidebar
          boardId={id}
          onClose={() => setShowActivitySidebar(false)}
        />
      )}

      {showSettings && (
        <BoardSettings
          board={board}
          onClose={() => setShowSettings(false)}
          onUpdate={fetchBoard}
        />
      )}
    </div>
  );
}

export default BoardPage;