import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiThumbsUp, FiUser, FiClock, FiMoreVertical, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi/index.js';

export default function DiscussionForum({ courseId }) {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [userData, setUserData] = useState({});
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, unanswered

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, sortBy]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      
      // Fetch discussions
      let discussionsQuery = query(
        collection(db, "discussions"),
        where("courseId", "==", courseId)
      );

      if (sortBy === 'recent') {
        discussionsQuery = query(discussionsQuery, orderBy("createdAt", "desc"));
      } else if (sortBy === 'popular') {
        discussionsQuery = query(discussionsQuery, orderBy("likesCount", "desc"));
      }

      const discussionsSnapshot = await getDocs(discussionsQuery);
      const discussionsData = await Promise.all(
        discussionsSnapshot.docs.map(async (docSnapshot) => {
          const discussion = { id: docSnapshot.id, ...docSnapshot.data() };
          
          // Fetch user data for the post author
          if (discussion.authorId && !userData[discussion.authorId]) {
            const userDoc = await getDoc(doc(db, "users", discussion.authorId));
            if (userDoc.exists()) {
              setUserData(prev => ({
                ...prev,
                [discussion.authorId]: userDoc.data()
              }));
            }
          }

          // Fetch replies
          const repliesQuery = query(
            collection(db, "discussionReplies"),
            where("discussionId", "==", docSnapshot.id),
            orderBy("createdAt", "asc")
          );
          const repliesSnapshot = await getDocs(repliesQuery);
          const replies = await Promise.all(
            repliesSnapshot.docs.map(async (replyDoc) => {
              const reply = { id: replyDoc.id, ...replyDoc.data() };
              
              // Fetch user data for reply author
              if (reply.authorId && !userData[reply.authorId]) {
                const userDoc = await getDoc(doc(db, "users", reply.authorId));
                if (userDoc.exists()) {
                  setUserData(prev => ({
                    ...prev,
                    [reply.authorId]: userDoc.data()
                  }));
                }
              }
              
              return reply;
            })
          );

          return {
            ...discussion,
            replies
          };
        })
      );

      // Sort if needed
      if (sortBy === 'unanswered') {
        discussionsData.sort((a, b) => {
          if (a.replies.length === 0 && b.replies.length > 0) return -1;
          if (a.replies.length > 0 && b.replies.length === 0) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      setDiscussions(discussionsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPost.trim()) return;

    try {
      await addDoc(collection(db, "discussions"), {
        courseId,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "Anonymous",
        authorPhotoURL: currentUser.photoURL || null,
        title: newTitle.trim(),
        content: newPost.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        likes: [],
        repliesCount: 0,
        isResolved: false
      });

      setNewTitle('');
      setNewPost('');
      fetchDiscussions();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleReply = async (discussionId) => {
    if (!replyText.trim()) return;

    try {
      // Add reply
      await addDoc(collection(db, "discussionReplies"), {
        discussionId,
        courseId,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "Anonymous",
        authorPhotoURL: currentUser.photoURL || null,
        content: replyText.trim(),
        createdAt: serverTimestamp(),
        likesCount: 0,
        likes: []
      });

      // Update replies count
      const discussionRef = doc(db, "discussions", discussionId);
      await updateDoc(discussionRef, {
        repliesCount: increment(1),
        updatedAt: serverTimestamp()
      });

      setReplyText('');
      setReplyingTo(null);
      fetchDiscussions();
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleLike = async (discussionId) => {
    try {
      const discussionRef = doc(db, "discussions", discussionId);
      const discussionDoc = await getDoc(discussionRef);
      const discussion = discussionDoc.data();
      const likes = discussion.likes || [];

      if (likes.includes(currentUser.uid)) {
        // Unlike
        await updateDoc(discussionRef, {
          likes: likes.filter(uid => uid !== currentUser.uid),
          likesCount: increment(-1)
        });
      } else {
        // Like
        await updateDoc(discussionRef, {
          likes: [...likes, currentUser.uid],
          likesCount: increment(1)
        });
      }

      fetchDiscussions();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiMessageSquare className="mr-2" />
          Discussion Forum
        </h2>
        <p className="text-gray-600 mt-1">Ask questions, share insights, and connect with fellow learners</p>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setSortBy('unanswered')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'unanswered'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unanswered
          </button>
        </div>
        <span className="text-sm text-gray-500">{discussions.length} discussions</span>
      </div>

      {/* Create New Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Start a Discussion</h3>
        <form onSubmit={handleCreatePost}>
          <input
            type="text"
            placeholder="Discussion title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="What would you like to discuss? Ask a question or share your thoughts..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!newTitle.trim() || !newPost.trim()}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend className="mr-2" size={16} />
              Post Discussion
            </button>
          </div>
        </form>
      </motion.div>

      {/* Discussions List */}
      {discussions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FiMessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
          <p className="text-gray-600">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Discussion Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <img
                      src={userData[discussion.authorId]?.photoURL || "https://via.placeholder.com/40"}
                      alt={discussion.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{discussion.title}</h3>
                        {discussion.isResolved && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Resolved
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <span>{discussion.authorName}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <FiClock className="mr-1" size={12} />
                          {formatTimestamp(discussion.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <FiMoreVertical size={20} />
                  </button>
                </div>

                {/* Discussion Content */}
                <p className="text-gray-700 mb-4 ml-13">{discussion.content}</p>

                {/* Discussion Actions */}
                <div className="flex items-center space-x-4 ml-13">
                  <button
                    onClick={() => handleLike(discussion.id)}
                    className={`flex items-center space-x-1 text-sm ${
                      discussion.likes?.includes(currentUser.uid)
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    } transition-colors`}
                  >
                    <FiThumbsUp size={16} />
                    <span>{discussion.likesCount || 0}</span>
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <FiMessageSquare size={16} />
                    <span>{discussion.repliesCount || 0} replies</span>
                  </button>
                </div>
              </div>

              {/* Replies */}
              {discussion.replies && discussion.replies.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="space-y-4">
                    {discussion.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start space-x-3">
                        <img
                          src={userData[reply.authorId]?.photoURL || "https://via.placeholder.com/32"}
                          alt={reply.authorName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-sm mb-1">
                            <span className="font-medium text-gray-900">{reply.authorName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 text-xs">
                              {formatTimestamp(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <AnimatePresence>
                {replyingTo === discussion.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 px-6 py-4 bg-gray-50"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={currentUser?.photoURL || "https://via.placeholder.com/32"}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <textarea
                          placeholder="Write your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(discussion.id)}
                            disabled={!replyText.trim()}
                            className="flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <FiSend className="mr-1" size={14} />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
