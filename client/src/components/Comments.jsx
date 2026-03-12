import React, { useState, useEffect, useCallback, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const socket = io('http://localhost:5001');

const Comments = ({ inventoryId }) => {
  const { userId } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/inventory/${inventoryId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (e) {
      console.error('Error fetching comments', e);
    }
  }, [inventoryId]);

  useEffect(() => {
    socket.emit('join_inventory', inventoryId);
    socket.on('receive_comment', (newComment) => {
      setComments((prev) => [newComment, ...prev]);
    });
    fetchComments();
    return () => {
      socket.emit('leave_inventory', inventoryId);
      socket.off('receive_comment');
    };
  }, [inventoryId, fetchComments]);

  const sendComment = () => {
    if (!text.trim()) return;
    const commentData = { inventoryId, userId, text, createdAt: new Date() };
    socket.emit('send_comment', commentData);
    setText('');
  };

  return (
    <div>
      <div className="input-field" style={{ display: 'flex', gap: '10px' }}>
        <input type="text" value={text} placeholder="Написать..." onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendComment()} />
        <button className="btn blue" onClick={sendComment}><i className="material-icons">send</i></button>
      </div>
      <ul className="collection">
        {comments.map((c, i) => (
          <li key={i} className="collection-item avatar">
            <i className="material-icons circle blue">person</i>
            <span className="title bold">User #{c.userId}</span>
            <p>{c.text}</p>
            <span className="grey-text" style={{ fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;