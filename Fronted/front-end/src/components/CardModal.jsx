// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { getCard, updateCard, deleteCard, createComment, getComments } from '../services/api';
// import './CardModal.css';

// function CardModal({ card: initialCard, onClose, onUpdate }) {
//   const { user } = useContext(AuthContext);
//   const [card, setCard] = useState(initialCard);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [isEditing, setIsEditing] = useState({
//     title: false,
//     description: false
//   });
//   const [editValues, setEditValues] = useState({
//     title: initialCard.title,
//     description: initialCard.description || ''
//   });

//   useEffect(() => {
//     fetchCardDetails();
//   }, [initialCard._id]);

//   const fetchCardDetails = async () => {
//     try {
//       const res = await getCard(initialCard._id);
//       setCard(res.data);
//       setComments(res.data.comments || []);
//     } catch (error) {
//       console.error('Error fetching card:', error);
//     }
//   };

//   const handleUpdate = async (field, value) => {
//     try {
//       await updateCard(card._id, { [field]: value });
//       setCard({ ...card, [field]: value });
//       setIsEditing({ ...isEditing, [field]: false });
//       onUpdate();
//     } catch (error) {
//       console.error('Error updating card:', error);
//     }
//   };

//   const handleAddComment = async (e) => {
//     e.preventDefault();
//     if (!newComment.trim()) return;

//     try {
//       const res = await createComment({
//         text: newComment,
//         card: card._id
//       });
//       setComments([...comments, res.data]);
//       setNewComment('');
//     } catch (error) {
//       console.error('Error adding comment:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (window.confirm('Delete this card?')) {
//       try {
//         await deleteCard(card._id);
//         onUpdate();
//         onClose();
//       } catch (error) {
//         console.error('Error deleting card:', error);
//       }
//     }
//   };

//   const handleLabelAdd = async () => {
//     const label = prompt('Enter label:');
//     if (label) {
//       const newLabels = [...(card.labels || []), label];
//       await handleUpdate('labels', newLabels);
//     }
//   };

//   const handleLabelRemove = async (labelToRemove) => {
//     const newLabels = card.labels.filter(l => l !== labelToRemove);
//     await handleUpdate('labels', newLabels);
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="card-modal" onClick={(e) => e.stopPropagation()}>
//         <button className="modal-close" onClick={onClose}>✕</button>
        
//         <div className="modal-content">
//           <div className="modal-main">
//             {/* Title */}
//             {isEditing.title ? (
//               <input
//                 type="text"
//                 value={editValues.title}
//                 onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
//                 onBlur={() => handleUpdate('title', editValues.title)}
//                 onKeyPress={(e) => e.key === 'Enter' && handleUpdate('title', editValues.title)}
//                 autoFocus
//                 className="edit-title"
//               />
//             ) : (
//               <h2 onClick={() => setIsEditing({ ...isEditing, title: true })}>
//                 {card.title}
//               </h2>
//             )}

//             {/* Labels */}
//             <div className="modal-section">
//               <h3>Labels</h3>
//               <div className="labels-container">
//                 {card.labels?.map((label, index) => (
//                   <span key={index} className="label">
//                     {label}
//                     <button onClick={() => handleLabelRemove(label)}>✕</button>
//                   </span>
//                 ))}
//                 <button onClick={handleLabelAdd} className="btn-add-label">+ Add</button>
//               </div>
//             </div>

//             {/* Description */}
//             <div className="modal-section">
//               <h3>Description</h3>
//               {isEditing.description ? (
//                 <textarea
//                   value={editValues.description}
//                   onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
//                   onBlur={() => handleUpdate('description', editValues.description)}
//                   rows={4}
//                   autoFocus
//                 />
//               ) : (
//                 <p 
//                   onClick={() => setIsEditing({ ...isEditing, description: true })}
//                   className="description"
//                 >
//                   {card.description || 'Add description...'}
//                 </p>
//               )}
//             </div>

//             {/* Comments */}
//             <div className="modal-section">
//               <h3>Comments</h3>
//               <form onSubmit={handleAddComment} className="comment-form">
//                 <img src={user?.avatar} alt="" className="user-avatar-small" />
//                 <input
//                   type="text"
//                   value={newComment}
//                   onChange={(e) => setNewComment(e.target.value)}
//                   placeholder="Write a comment..."
//                 />
//                 <button type="submit" className="btn-primary-sm">Post</button>
//               </form>

//               <div className="comments-list">
//                 {comments.map(comment => (
//                   <div key={comment._id} className="comment">
//                     <img src={comment.author?.avatar} alt="" className="user-avatar-small" />
//                     <div className="comment-content">
//                       <div className="comment-header">
//                         <strong>{comment.author?.name}</strong>
//                         <span className="comment-time">{formatDate(comment.createdAt)}</span>
//                       </div>
//                       <p>{comment.text}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="modal-sidebar">
//             <h3>Actions</h3>
            
//             <button className="sidebar-btn">
//                Due Date
//             </button>
            
//             <button className="sidebar-btn" onClick={handleLabelAdd}>
//               Labels
//             </button>
            
//             <hr />
            
//             <button className="sidebar-btn delete" onClick={handleDelete}>
//                Delete Card
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CardModal;
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  getCard,
  updateCard,
  deleteCard,
  createComment,
  uploadAttachment
} from '../services/api';
import './CardModal.css';

function CardModal({ card: initialCard, onClose, onUpdate }) {
  const { user } = useContext(AuthContext);
  const [card, setCard] = useState(initialCard);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState(initialCard.attachments || []);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState({
    title: false,
    description: false
  });
  const [editValues, setEditValues] = useState({
    title: initialCard.title,
    description: initialCard.description || ''
  });

  useEffect(() => {
    fetchCardDetails();
  }, [initialCard._id]);

  const fetchCardDetails = async () => {
    try {
      const res = await getCard(initialCard._id);
      setCard(res.data);
      setComments(res.data.comments || []);
      setAttachments(res.data.attachments || []);
    } catch (error) {
      console.error('Error fetching card:', error);
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      await updateCard(card._id, { [field]: value });
      setCard({ ...card, [field]: value });
      setIsEditing({ ...isEditing, [field]: false });
      onUpdate();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await createComment({
        text: newComment,
        card: card._id
      });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this card?')) {
      try {
        await deleteCard(card._id);
        onUpdate();
        onClose();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const handleLabelAdd = async () => {
    const label = prompt('Enter label:');
    if (label) {
      const newLabels = [...(card.labels || []), label];
      await handleUpdate('labels', newLabels);
    }
  };

  const handleLabelRemove = async (labelToRemove) => {
    const newLabels = card.labels.filter((l) => l !== labelToRemove);
    await handleUpdate('labels', newLabels);
  };

  // ✅ File Upload
  // const handleFileUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   try {
  //     const res = await uploadAttachment(card._id, file);
  //     // ✅ Backend returns { success: true, attachment, card }
  //     const newAttachment = res.data.attachment;
  //     setAttachments((prev) => [...prev, newAttachment]);
  //     setCard((prev) => ({
  //       ...prev,
  //       attachments: [...(prev.attachments || []), newAttachment],
  //     }));
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //   }
  // };
  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const res = await uploadAttachment(card._id, file);
    const newAttachment = res.data.attachment;

    setAttachments(prev => [...prev, newAttachment]);
    setCard(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachment]
    }));
  } catch (err) {
    console.error('Error uploading file:', err);
  }
};


  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-content">
          <div className="modal-main">
            {/* Title */}
            {isEditing.title ? (
              <input
                type="text"
                value={editValues.title}
                onChange={(e) =>
                  setEditValues({ ...editValues, title: e.target.value })
                }
                onBlur={() => handleUpdate('title', editValues.title)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleUpdate('title', editValues.title)
                }
                autoFocus
                className="edit-title"
              />
            ) : (
              <h2 onClick={() => setIsEditing({ ...isEditing, title: true })}>
                {card.title}
              </h2>
            )}

            {/* Labels */}
            <div className="modal-section">
              <h3>Labels</h3>
              <div className="labels-container">
                {card.labels?.map((label, index) => (
                  <span key={index} className="label">
                    {label}
                    <button onClick={() => handleLabelRemove(label)}>✕</button>
                  </span>
                ))}
                <button onClick={handleLabelAdd} className="btn-add-label">
                  + Add
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="modal-section">
              <h3>Description</h3>
              {isEditing.description ? (
                <textarea
                  value={editValues.description}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      description: e.target.value
                    })
                  }
                  onBlur={() =>
                    handleUpdate('description', editValues.description)
                  }
                  rows={4}
                  autoFocus
                />
              ) : (
                <p
                  onClick={() =>
                    setIsEditing({ ...isEditing, description: true })
                  }
                  className="description"
                >
                  {card.description || 'Add description...'}
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="modal-section">
              <h3>Comments</h3>
              <form onSubmit={handleAddComment} className="comment-form">
                <img src={user?.avatar} alt="" className="user-avatar-small" />
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button type="submit" className="btn-primary-sm">
                  Post
                </button>
              </form>

              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <img
                      src={comment.author?.avatar}
                      alt=""
                      className="user-avatar-small"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <strong>{comment.author?.name}</strong>
                        <span className="comment-time">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="modal-sidebar">
            <h3>Actions</h3>

            <button className="sidebar-btn">Due Date</button>

            <button className="sidebar-btn" onClick={handleLabelAdd}>
              Labels
            </button>

            {/* File Upload */}
            <button
              className="sidebar-btn"
              onClick={() => document.getElementById('fileInput').click()}
            >
              📎 Attach File
            </button>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {/* Attachments list */}
            {attachments.length > 0 && (
              <div className="attachments-list">
                <h4>Attachments</h4>
                {attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📄 {file.name}
                    </a>
                    <span className="file-type">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}

            <hr />

            <button className="sidebar-btn delete" onClick={handleDelete}>
              Delete Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;
