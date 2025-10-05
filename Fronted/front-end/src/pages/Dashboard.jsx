
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getBoards, createBoard, getWorkspaces, createWorkspace, deleteBoard } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [boardColor, setBoardColor] = useState('#0079bf');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
    fetchWorkspaces();
  }, []);

  const getContrastColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#172b4d' : '#ffffff';
  };

  const fetchBoards = async () => {
    try {
      const res = await getBoards();
      setBoards(res.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await getWorkspaces();
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        setSelectedWorkspace(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    let workspaceId = selectedWorkspace;
    if (!workspaceId && workspaces.length === 0) {
      const wsRes = await createWorkspace({ name: 'My Workspace' });
      workspaceId = wsRes.data._id;
      setWorkspaces([wsRes.data]);
    }

    try {
      const res = await createBoard({
        title: newBoardTitle,
        workspace: workspaceId,
        visibility: 'workspace',
        color: boardColor
      });
      setBoards([...boards, res.data]);
      setNewBoardTitle('');
      setBoardColor('#0079bf');
      setShowModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
      alert('Failed to create board. Please try again.');
    }
  };

  const handleDeleteClick = (boardId, boardTitle, e) => {
    e.stopPropagation(); 
    setBoardToDelete({ id: boardId, title: boardTitle });
    setShowDeleteConfirm(true);
  };

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteBoard(boardToDelete.id);
      setBoards(boards.filter(board => board._id !== boardToDelete.id));
      setShowDeleteConfirm(false);
      setBoardToDelete(null);
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board. You must be the owner to delete a board.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setBoardToDelete(null);
  };

  const colorPalette = [
    '#0079bf', '#d29034', '#519839', '#b04632', '#89609e',
    '#cd5a91', '#4bbf6b', '#00aecc', '#838c91'
  ];

  return (
    <div className="dashboard">
           
           <nav className="navbar">
  <h2>Kanban Board</h2>
  <div className="nav-right">
    <div className="user-dropdown">
      <div className="user-trigger">
        <img src={user?.avatar} alt={user?.name} className="user-avatar-small" />
        <span>{user?.name}</span>
        <i className="arrow-down"></i>
      </div>

      <div className="dropdown-menu">
        <button className="dropdown-item">Profile</button>
        <button className="dropdown-item">Settings</button>
        <button onClick={logout} className="dropdown-item logout">Logout</button>
      </div>
    </div>
  </div>
</nav>
      


      <div className="dashboard-content">
        <div className="boards-header">
          <h1>Your Boards</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Create Board</button>
        </div>

        <div className="boards-grid">
          {boards.map(board => {
            const bgColor = board.color || '#0079bf';
            const textColor = getContrastColor(bgColor);

            return (
              <div 
                key={board._id} 
                className="board-card"
                style={{
                  backgroundColor: bgColor,
                  backgroundImage: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}ee 100%)`,
                  color: textColor
                }}
              >
                <div onClick={() => navigate(`/board/${board._id}`)} style={{ cursor: 'pointer' }}>
                  <h3 style={{ color: textColor }}>{board.title}</h3>
                  <p className="board-workspace" style={{ color: textColor, opacity: 0.85 }}>
                    {board.workspace?.name}
                  </p>
                  <div className="board-members">
                    {board.members?.slice(0, 3).map(member => (
                      <img
                        key={member._id}
                        src={member.avatar}
                        alt={member.name}
                        className="member-avatar"
                        title={member.name}
                      />
                    ))}
                    {board.members?.length > 3 && (
                      <span
                        className="more-members"
                        style={{
                          backgroundColor: textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          color: textColor
                        }}
                      >
                        +{board.members.length - 3}
                      </span>
                    )}
                  </div>
                  
                </div>
                     {/* Delete Button */}
                <button 
                  className="delete-board-btn"
                  onClick={(e) => handleDeleteClick(board._id, board.title, e)}
                  style={{
                    backgroundColor: textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    color: textColor
                  }}
                  title="Delete board"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>

        {boards.length === 0 && (
          <div className="empty-state">
            <p>No boards yet. Create your first board to get started!</p>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label>Board Title</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Enter board title"
                  autoFocus
                />

                <label>Board Color</label>
                <div className="color-selection">
                  <div className="color-palette">
                    {colorPalette.map(color => (
                      <div
                        key={color}
                        className={`color-option ${boardColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setBoardColor(color)}
                        title={color}
                      >
                        {boardColor === color && (
                          <span className="check-mark">✓</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="color-picker"
                      value={boardColor}
                      onChange={(e) => setBoardColor(e.target.value)}
                    />
                    <span className="color-label">Custom Color</span>
                  </div>
                </div>

                <div className="board-preview">
                  <div
                    className="preview-card"
                    style={{
                      backgroundColor: boardColor,
                      backgroundImage: `linear-gradient(135deg, ${boardColor} 0%, ${boardColor}ee 100%)`,
                      color: getContrastColor(boardColor)
                    }}
                  >
                    <h4 style={{ color: getContrastColor(boardColor) }}>
                      {newBoardTitle || 'Board Preview'}
                    </h4>
                    <p style={{ color: getContrastColor(boardColor), opacity: 0.85 }}>
                      Preview text
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Board?</h2>
            <p className="delete-warning">
              Are you sure you want to delete "<strong>{boardToDelete?.title}</strong>"?
              <br /><br />
              This action cannot be undone. All lists, cards, and comments will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={handleCancelDelete} 
                className="btn-secondary"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteBoard} 
                className="btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Board'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;