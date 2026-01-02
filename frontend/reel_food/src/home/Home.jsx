import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import BottomNav from '../components/BottomNav';
import ReelItem from './ReelItem';
import './Home.css';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [likedIds, setLikedIds] = useState(new Set());
    const [savedIds, setSavedIds] = useState(new Set());
    const [processingIds, setProcessingIds] = useState(new Set());
    const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/food`, {
                    withCredentials: true
                });
                let data = response.data.foodItems || []; 
                
                // Fisher-Yates Shuffle
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }

                if (location.state?.videoId) {
                    const targetIndex = data.findIndex(v => v._id === location.state.videoId);
                    if (targetIndex !== -1) {
                        const [targetVideo] = data.splice(targetIndex, 1);
                        data.unshift(targetVideo);
                        
                    }
                }

                setVideos(data);
                
                const initialLiked = new Set();
                const initialSaved = new Set();
                data.forEach(item => {
                    if (item.isLiked) initialLiked.add(item._id);
                    if (item.isSaved) initialSaved.add(item._id);
                });
                setLikedIds(initialLiked);
                setSavedIds(initialSaved);
            } catch (error) {
                console.error("Error fetching videos:", error);
                if (error.response?.status === 401 || error.response?.status === 400) {
                    navigate('/user/login');
                }
            }
        };

        fetchVideos();
    }, []);

    // IntersectionObserver logic moved to ReelItem for better performance and stability
    // This prevents parent re-renders from messing with video refs.

    const handleVisitStore = useCallback((e, video) => {
        e.stopPropagation();
        const partnerId = video.foodPartner || video._id; 
        navigate(`/food-partner/${partnerId}`);
    }, [navigate]);

    const toggleMute = useCallback((e) => {
        e.stopPropagation();
        setIsMuted(prev => !prev);
    }, []);

    const toggleLike = useCallback(async (e, id) => {
        e.stopPropagation();
        
        if (processingIds.has(id)) return;

        try {
            setProcessingIds(prev => new Set(prev).add(id));

            await axios.post(`${API_URL}/api/food/like`, { foodId: id }, {
                withCredentials: true
            });
            
            setLikedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
            
            setVideos(prevVideos => prevVideos.map(video => {
                if (video._id === id) {                   
                    const isLikedNow = likedIds.has(id); 
                    return {
                        ...video,
                        likeCount: Math.max(0, (video.likeCount || 0) + (isLikedNow ? -1 : 1))
                    };
                }
                return video;
            }));

        } catch (error) {
            console.error("Error liking food:", error);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }, [processingIds, likedIds]);

    const toggleSave = useCallback(async (e, id) => {
        e.stopPropagation();
        try {
            await axios.post(`${API_URL}/api/food/save`, { foodId: id }, {
                withCredentials: true
            });
            setSavedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        } catch (error) {
            console.error("Error saving food:", error);
        }
    }, []);

    if (videos.length === 0) {
        return (
            <div className="loading-container">
                <div className="skeleton skeleton-video"></div>
                
                <div className="skeleton-actions">
                    <div className="skeleton skeleton-icon"></div>
                    <div className="skeleton skeleton-icon"></div>
                    <div className="skeleton skeleton-icon"></div>
                    <div className="skeleton skeleton-icon"></div>
                </div>

                <div className="skeleton-overlay">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-desc"></div>
                    <div className="skeleton skeleton-desc-short"></div>
                    <div className="skeleton skeleton-btn"></div>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="reels-container">
            {videos.map((video, index) => (
                <ReelItem
                    key={video._id || index}
                    // Self-managed intersection observer inside ReelItem
                    video={video}
                    isMuted={isMuted}
                    toggleMute={toggleMute}
                    toggleLike={toggleLike}
                    toggleSave={toggleSave}
                    handleVisitStore={handleVisitStore}
                    likedIds={likedIds}
                    savedIds={savedIds}
                />
            ))}
            <BottomNav />
        </div>
    );
}

export default Home;
