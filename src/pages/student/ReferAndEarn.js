import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/student/Navbar.js';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaCopy, FaInstagram, FaRegCheckCircle } from 'react-icons/fa/index.esm.js';

export default function ReferAndEarn() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralStats, setReferralStats] = useState({
    referralCode: '',
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    referralHistory: []
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReferralData() {
      try {
        if (!currentUser) return;

        // Check if user has a referral code already
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (!userData.referralCode) {
            // Generate a new referral code if user doesn't have one
            const referralCode = generateReferralCode(userData.name || currentUser.email);
            await updateDoc(userRef, {
              referralCode: referralCode
            });
            
            // Create a referral document to track stats
            await setDoc(doc(db, "referrals", currentUser.uid), {
              userId: currentUser.uid,
              referralCode: referralCode,
              totalReferrals: 0,
              successfulReferrals: 0,
              pendingReferrals: 0,
              totalEarnings: 0,
              referralHistory: []
            });
            
            setReferralStats(prevStats => ({
              ...prevStats,
              referralCode: referralCode
            }));
          } else {
            // Fetch existing referral stats
            const referralDoc = await getDoc(doc(db, "referrals", currentUser.uid));
            
            if (referralDoc.exists()) {
              setReferralStats(referralDoc.data());
            } else {
              // Create a referral document with default values
              const defaultStats = {
                userId: currentUser.uid,
                referralCode: userData.referralCode,
                totalReferrals: 0,
                successfulReferrals: 0,
                pendingReferrals: 0,
                totalEarnings: 0,
                referralHistory: []
              };
              
              await setDoc(doc(db, "referrals", currentUser.uid), defaultStats);
              setReferralStats(defaultStats);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching referral data:", err);
        setError("Failed to load your referral data. Please try again later.");
        setLoading(false);
      }
    }

    fetchReferralData();
  }, [currentUser]);

  // Generate a unique referral code based on user's name
  const generateReferralCode = (name) => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${cleanName}${randomStr}`;
  };

  // Get referral link with the user's code
  const getReferralLink = () => {
    return `https://mentneo.com/signup?ref=${referralStats.referralCode}`;
  };

  // Copy referral link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Share on social media platforms
  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`🎉 Join Mentneo with my referral link and start your tech career journey! Use my code: ${referralStats.referralCode}\n\n${getReferralLink()}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getReferralLink())}`, '_blank');
  };

  const shareOnTwitter = () => {
    const message = encodeURIComponent(`Join Mentneo with my referral code: ${referralStats.referralCode} and start your tech career journey! ${getReferralLink()}`);
    window.open(`https://twitter.com/intent/tweet?text=${message}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getReferralLink())}`, '_blank');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't have a direct share link API, 
    // so we'll copy the link to clipboard and show instructions
    navigator.clipboard.writeText(getReferralLink());
    alert("Link copied! You can now paste it in your Instagram bio or story.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading your referral dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">🎉 Mentneo Refer & Earn Program 🎉</h1>
            <p className="text-xl text-gray-600">Share Mentneo with your friends and start earning instantly!</p>
          </div>

          {error && (
            <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* How it works section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">✨ How it works</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Share your unique referral link with friends</h3>
                  <p className="text-gray-600">Send your personal referral link to friends who might be interested in Mentneo's courses.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Friends join using your referral</h3>
                  <p className="text-gray-600">When your friend creates an account using your link, you earn ₹50 instantly.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Earn unlimited rewards</h3>
                  <p className="text-gray-600">The more you refer, the more you earn – there's no limit to your earnings!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and referral code section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden col-span-1">
              <div className="bg-green-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Your Referral Stats</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Total Referrals:</span>
                  <span className="text-lg font-semibold">{referralStats.totalReferrals}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Successful Referrals:</span>
                  <span className="text-lg font-semibold">{referralStats.successfulReferrals}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Pending Referrals:</span>
                  <span className="text-lg font-semibold">{referralStats.pendingReferrals}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="text-2xl font-bold text-green-600">₹{referralStats.totalEarnings}</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden col-span-2">
              <div className="bg-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Your Referral Link</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Share this link with your friends:</p>
                  <div className="flex flex-col sm:flex-row">
                    <input
                      type="text"
                      value={getReferralLink()}
                      className="flex-grow p-3 border border-gray-300 rounded-md sm:rounded-r-none bg-gray-50 text-gray-800 mb-2 sm:mb-0"
                      readOnly
                    />
                    <button
                      onClick={copyToClipboard}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md sm:rounded-l-none flex items-center justify-center"
                    >
                      {copied ? <FaRegCheckCircle className="mr-2" /> : <FaCopy className="mr-2" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Direct link to mentneo.com signup page with your referral code</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-3">Your Referral Code: <span className="font-bold">{referralStats.referralCode}</span></p>
                  <p className="text-gray-600 mb-4">Share on:</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={shareOnWhatsApp}
                      className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      <FaWhatsapp className="mr-2" /> WhatsApp
                    </button>
                    <button
                      onClick={shareOnFacebook}
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      <FaFacebook className="mr-2" /> Facebook
                    </button>
                    <button
                      onClick={shareOnTwitter}
                      className="flex items-center bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                      <FaTwitter className="mr-2" /> Twitter
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="flex items-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md"
                    >
                      <FaLinkedin className="mr-2" /> LinkedIn
                    </button>
                    <button
                      onClick={shareOnInstagram}
                      className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                    >
                      <FaInstagram className="mr-2" /> Instagram
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exclusive Features Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">🔥 Exclusive Features</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaRegCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Earn ₹50 for each successful referral.</span>
                </li>
                <li className="flex items-start">
                  <FaRegCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Track your referrals and earnings in your dashboard.</span>
                </li>
                <li className="flex items-start">
                  <FaRegCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Use your earnings for Mentneo courses, services, or withdraw as cash.</span>
                </li>
                <li className="flex items-start">
                  <FaRegCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Unlock bonus rewards after 10+ referrals.</span>
                </li>
                <li className="flex items-start">
                  <FaRegCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Be featured as a Top Referrer of the Month on our platform.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Referral History */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Referral History</h2>
            </div>
            <div className="p-6">
              {referralStats.referralHistory && referralStats.referralHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {referralStats.referralHistory.map((referral, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{referral.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {referral.date ? new Date(referral.date.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${referral.status === 'successful' ? 'bg-green-100 text-green-800' : 
                                referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {referral.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {referral.status === 'successful' ? '₹50' : '₹0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">You haven't made any referrals yet. Start sharing your referral link today!</p>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">👥 Invite • Earn • Grow with Mentneo</h2>
            <p className="text-lg text-gray-600 mb-6">Start today and turn your network into your net worth!</p>
            <button
              onClick={copyToClipboard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium text-lg"
            >
              {copied ? 'Link Copied!' : 'Copy Your Referral Link'}
            </button>
            <p className="mt-3 text-sm text-gray-500">This is a direct link to mentneo.com with your referral code</p>
          </div>
        </div>
      </div>
    </div>
  );
}
