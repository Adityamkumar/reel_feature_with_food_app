import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {API_URL} from '../config/api';
import BottomNav from '../components/BottomNav';
import {User, LogOut, Mail, ShoppingBag} from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/auth/user/me`, {withCredentials: true});
                setUser(response.data.user);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setLoading(false);
                navigate('/user/login');
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.get(`${API_URL}/api/auth/user/logout`, {withCredentials: true});
            navigate('/user/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) {
        return <div className="profile-page loading">Loading...</div>;
    }

    if (!user) 
        return null;
    

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h2>My Profile</h2>
            </header>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="avatar-section">
                        <div className="avatar-placeholder">
                            <span className="avatar-letter">
                                {
                                user.fullName ?. charAt(0) || 'U'
                            }</span>
                        </div>
                        <h3>{
                            user.fullName
                        }</h3>
                        <p className="user-handle">Foodie</p>
                    </div>

                    <div className="info-section">
                        <div className="info-row">
                            <Mail size={20}
                                className="info-icon"/>
                            <span>{
                                user.email
                            }</span>
                        </div>
                        <div className="info-row">
                            <ShoppingBag size={20}
                                className="info-icon"/>
                            <span>0 Orders</span>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <button className="logout-btn"
                        onClick={handleLogout}>
                        <LogOut size={20}/>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <BottomNav/>
        </div>
    );
};

export default UserProfile;
