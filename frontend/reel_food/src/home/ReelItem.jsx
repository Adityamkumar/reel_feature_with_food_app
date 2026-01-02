import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Volume2, VolumeX } from 'lucide-react';
import ProtectedVideo from '../components/ProtectedVideo';
import gsap from 'gsap';

// Simplified ReelItem with self-contained IntersectionObserver
const ReelItem = ({ video, isMuted, toggleMute, toggleLike, toggleSave, likedIds, savedIds, handleVisitStore }) => {
    const videoRef = useRef(null);
    const progressBarRef = useRef(null);
    const heartRef = useRef(null);
    const [showHeart, setShowHeart] = useState(false);
    const lastTap = useRef(0);

    // Intersection Observer for Autoplay
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            const videoEl = videoRef.current;
            if (!videoEl) return;

            if (entry.isIntersecting) {
                videoEl.currentTime = 0;
                const playPromise = videoEl.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        // console.log("Autoplay blocked", e);
                    });
                }
            } else {
                videoEl.pause();
                // videoEl.currentTime = 0; // Optional: reset on scroll away? usually reels don't reset completely, just pause.
            }
        }, {
            threshold: 0.6 // Play when 60% visible
        });

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || !progressBarRef.current) return;

        const updateProgress = () => {
            if (videoEl.duration && !videoEl.paused) {
                const percent = (videoEl.currentTime / videoEl.duration) * 100;
                gsap.set(progressBarRef.current, { width: `${percent}%` });
            }
        };

        // Add listener to GSAP's global ticker
        gsap.ticker.add(updateProgress);

        return () => {
            gsap.ticker.remove(updateProgress);
        };
    }, []);

    // Double Tap Logic
    const handleTap = (e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            handleDoubleTap(e);
            lastTap.current = 0; 
        } else {
            lastTap.current = now;
            togglePlay();
        }
    };

    const handleDoubleTap = (e) => {
        e.stopPropagation();
        
        const videoEl = videoRef.current;
        if (videoEl && videoEl.paused) {
            videoEl.play().catch(() => {}); 
        }

        // Show Heart and Trigger Animation
        setShowHeart(true);

        if (!likedIds.has(video._id)) {
            toggleLike(e, video._id);
        }
    };

    // Animate Heart when it appears
    useLayoutEffect(() => {
        if (showHeart && heartRef.current) {
            const tl = gsap.timeline({
                onComplete: () => setShowHeart(false)
            });

            tl.fromTo(heartRef.current, 
                { scale: 0, opacity: 0, rotation: -45 },
                { scale: 1.2, opacity: 1, rotation: 0, duration: 0.4, ease: "back.out(1.7)" }
            )
            .to(heartRef.current, 
                { scale: 1, duration: 0.1 }
            )
            .to(heartRef.current, 
                { scale: 0, opacity: 0, y: -50, duration: 0.4, delay: 0.3, ease: "power2.in" }
            );
        }
    }, [showHeart]);

    const togglePlay = () => {
        const videoEl = videoRef.current;
        if (videoEl) {
            if (videoEl.paused) {
                videoEl.play().catch(e => console.log("Play failed", e));
            } else {
                videoEl.pause();
            }
        }
    };
    
    // Wrapper click handler
    const handleWrapperClick = (e) => {
        e.preventDefault();
        handleTap(e);
    }

    return (
        <div className="reel-item">
            {/* Video Wrapper handles clicks */}
            <div className="video-wrapper" onClick={handleWrapperClick}>
                <ProtectedVideo
                    ref={videoRef}
                    src={video.video}
                    className="reel-video"
                    loop
                    muted={isMuted}
                    playsInline
                    preload='metadata'
                />
                
                {/* Double Tap Heart Animation */}
                {showHeart && (
                    <div className="heart-animation-container" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 25,
                        pointerEvents: 'none'
                    }}>
                        <div ref={heartRef}>
                            <Heart size={100} fill="#ff2d55" color="#ff2d55" strokeWidth={0} />
                        </div>
                    </div>
                )}
                
                {/* Progress Bar */}
                <div className="progress-container">
                    <div ref={progressBarRef} className="progress-bar" style={{ width: '0%' }}></div>
                </div>
            </div>

            {/* Right Sidebar Actions */}
            <div className="reel-actions">
                <div className="action-item" onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleMute(e);
                }}>
                    {isMuted ? (
                        <VolumeX size={32} color="white" strokeWidth={1.5} />
                    ) : (
                        <Volume2 size={32} color="white" strokeWidth={1.5} />
                    )}
                </div>

                <div className="action-item" onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleLike(e, video._id);
                }}>
                    <Heart
                        size={32}
                        color={likedIds.has(video._id) ? "#ff2d55" : "white"}
                        fill={likedIds.has(video._id) ? "#ff2d55" : "transparent"}
                        strokeWidth={1.5}
                    />
                    <span>{video.likeCount || 0}</span>
                </div>
                <div className="action-item" onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleSave(e, video._id);
                }}>
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
    );
};

export default React.memo(ReelItem);
