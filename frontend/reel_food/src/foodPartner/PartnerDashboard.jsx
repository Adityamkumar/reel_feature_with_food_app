import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import './PartnerProfile.css';

const PartnerDashboard = () => {
    const navigate = useNavigate();
    const [partnerVideos, setPartnerVideos] = useState([]);
    const [partner, setPartner] = useState(null);
    const [stats, setStats] = useState({ meals: 0, customers: '0' });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch Current Partner Details
            const partnerResponse = await axios.get('http://localhost:3000/api/food-partner/profile/me', {
                withCredentials: true
            });
            setPartner(partnerResponse.data.foodPartner);

            // Fetch My Videos
            const videoResponse = await axios.get('http://localhost:3000/api/food/my-foods', {
                withCredentials: true 
            });
            
            const myVideos = videoResponse.data.foodItems || [];
            setPartnerVideos(myVideos);
            
            setStats({
                meals: myVideos.length,
                customers: '1.2K' // Placeholder or derived from backend if available
            });

        } catch (error) {
            console.error("Error loading dashboard:", error);
            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                navigate('/food-partner/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const deleteVideo = async (e, videoId) => {
        e.stopPropagation(); // Prevent opening video
        if (!window.confirm("Are you sure you want to delete this video? This cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/api/food/${videoId}`, {
                withCredentials: true
            });
            // Update UI locally
            setPartnerVideos(prev => prev.filter(v => v._id !== videoId));
            alert("Video deleted successfully");
        } catch (error) {
            console.error("Error deleting video:", error);
            alert("Failed to delete video");
        }
    };

    const openVideo = (video) => {
        // Option to view the video or go to feed with this video focused
        navigate('/', { state: { videoId: video._id } });
    };

    if (loading) return <div className="profile-container" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-back-btn" onClick={() => navigate('/create-food')}>
                <ArrowLeft size={24} />
            </div>

            <div className="profile-header-card">
                <div className="profile-content-wrapper">
                    <div className="profile-left-section">
                        <div className="profile-avatar-container">
                             <img 
                                src={`https://ui-avatars.com/api/?name=${partner?.name || 'Partner'}&background=random&color=fff&size=128`} 
                                alt="Profile" 
                                className="profile-avatar-img"
                            />
                        </div>
                    </div>
                    
                    <div className="profile-middle-section">
                        <h1 className="partner-title">{partner?.name || "Loading..."}</h1>
                        <p className="partner-location">
                            {partner?.address || "Location unavailable"}
                        </p>
                        <div className="partner-tags">
                            <span className="tag">Restaurant Dashboard</span>
                            <span className="tag">Partner</span>
                        </div>
                    </div>

                    <div className="profile-right-section">
                        <div className="stat-group">
                            <span className="stat-value highlight">{stats.meals}</span>
                            <span className="stat-label">Meals</span>
                        </div>
                        <div className="stat-divider-vertical"></div>
                        <div className="stat-group">
                            <span className="stat-value">{stats.customers}</span>
                            <span className="stat-label">Served</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="content-divider">
                <span>YOUR UPLOADS</span>
            </div>

            <div className="video-grid-container">
                {partnerVideos.map((video) => (
                    <div className="grid-video-card" key={video._id} onClick={() => openVideo(video)}>
                        <video 
                            src={video.video} 
                            className="grid-video-element"
                            muted
                            playsInline
                            loop
                            onMouseOver={e => e.target.play()}
                            onMouseOut={e => {
                                e.target.pause();
                                e.target.currentTime = 0;
                            }}
                        />
                         <div className="video-overlay-gradient">
                            <span>▶</span>
                         </div>
                         
                         {/* Delete Button */}
                         <button 
                            className="delete-video-btn"
                            onClick={(e) => deleteVideo(e, video._id)}
                            title="Delete Video"
                         >
                             <Trash2 size={16} />
                         </button>
                    </div>
                ))}
                
                {partnerVideos.length === 0 && (
                    <div className="empty-state">
                        <p>No reels yet. Upload your first video!</p>
                        <button className="submit-btn" style={{marginTop: '20px', width: 'auto'}} onClick={() => navigate('/create-food')}>
                            Upload Video
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerDashboard;
