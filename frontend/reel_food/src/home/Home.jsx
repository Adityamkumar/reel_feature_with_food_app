import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import './Home.css';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [likedIds, setLikedIds] = useState(new Set());
    const [savedIds, setSavedIds] = useState(new Set());
    const videoRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/food', {
                    withCredentials: true
                });
                let data = response.data.foodItems || []; 
                
                // Fisher-Yates Shuffle
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }

                // If coming from Saved page, prioritize that video
                if (location.state?.videoId) {
                    const targetIndex = data.findIndex(v => v._id === location.state.videoId);
                    if (targetIndex !== -1) {
                        const [targetVideo] = data.splice(targetIndex, 1);
                        data.unshift(targetVideo);
                        
                        // Clear state so random play resume on next refresh? optional.
                        // window.history.replaceState({}, document.title)
                    }
                }

                setVideos(data);
                
                // Initialize liked and saved states
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

    useEffect(() => {
        // Only set up observer if we have videos
        if (videos.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6
        };

        const handleIntersection = (entries) => {
            entries.forEach(entry => {
                const videoElement = entry.target;
                if (entry.isIntersecting) {
                    videoElement.currentTime = 0;
                    const playPromise = videoElement.play();
                    if (playPromise !== undefined) {
                      playPromise.catch(e => {
                        console.log("Autoplay prevented:", e);
                      });
                    }
                } else {
                    videoElement.pause();
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        videoRefs.current.forEach(video => {
            if (video) observer.observe(video);
        });

        return () => {
            videoRefs.current.forEach(video => {
                if (video) observer.unobserve(video);
            });
            observer.disconnect();
        };
    }, [videos]);

    const handleVisitStore = (e, video) => {
        e.stopPropagation();
        const partnerId = video.foodPartner || video._id; 
        navigate(`/food-partner/${partnerId}`);
    };

    const togglePlay = (index) => {
        const video = videoRefs.current[index];
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    };

    const toggleLike = async (e, id) => {
        e.stopPropagation();
        try {
            await axios.post('http://localhost:3000/api/food/like', { foodId: id }, {
                withCredentials: true
            });
            setLikedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
            
            // Optimistically update the like count in the videos array
            setVideos(prevVideos => prevVideos.map(video => {
                if (video._id === id) {
                    const isLiked = likedIds.has(id); // Current state before update was processed by setLikedIds? 
                    // Wait, setLikedIds is async/batched. Better to check the Set inside the click handler or use the previous set derivation.
                    // Actually, simpler logic: check if we are unliking or liking based on current Set state.
                    const currentlyLiked = likedIds.has(id);
                    return {
                        ...video,
                        likeCount: (video.likeCount || 0) + (currentlyLiked ? -1 : 1)
                    };
                }
                return video;
            }));
        } catch (error) {
            console.error("Error liking food:", error);
        }
    };

    const toggleSave = async (e, id) => {
        e.stopPropagation();
        try {
            await axios.post('http://localhost:3000/api/food/save', { foodId: id }, {
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
    };

    if (videos.length === 0) {
        return <div className="loading-state">Loading delicious food reels...</div>;
    }

    return (
        <div className="reels-container">
            {videos.map((video, index) => (
                <div className="reel-item" key={video._id || index}>
                    <video
                        ref={el => videoRefs.current[index] = el}
                        src={video.video} 
                        className="reel-video"
                        onClick={() => togglePlay(index)}
                        loop
                        muted
                        playsInline
                        preload='metadata'
                    />
                    
                    {/* Right Sidebar Actions */}
                    <div className="reel-actions">
                        <div className="action-item" onClick={(e) => toggleLike(e, video._id)}>
                            <Heart 
                                size={32} 
                                color={likedIds.has(video._id) ? "#ff2d55" : "white"} 
                                fill={likedIds.has(video._id) ? "#ff2d55" : "transparent"} 
                                strokeWidth={1.5} 
                            />
                            <span>{video.likeCount || 0}</span>
                        </div>
                        <div className="action-item" onClick={(e) => toggleSave(e, video._id)}>
                            <Bookmark 
                                size={32} 
                                color="white" 
                                fill={savedIds.has(video._id) ? "white" : "transparent"} 
                                strokeWidth={1.5} 
                            />
                            <span>{savedIds.has(video._id) ? 'Saved' : 'Save'}</span>
                        </div>
                        <div className="action-item">
                            <MessageCircle size={32} color="white" strokeWidth={1.5} />
                            <span>45</span>
                        </div>
                    </div>

                    {/* Bottom Overlay Info */}
                    <div className="reel-overlay">
                        <div className="reel-content">
                            <div className="reel-info">
                                <h3 className="reel-title">{video.name || "Delicious Food"}</h3>
                                <p className="reel-description">{video.description}</p>
                            </div>
                            <button
                                className="visit-store-btn"
                                onClick={(e) => handleVisitStore(e, video)}
                            >
                                Visit Store
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <BottomNav />
        </div>
    );
}

export default Home;