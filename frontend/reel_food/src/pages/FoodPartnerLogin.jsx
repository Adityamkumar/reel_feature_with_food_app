import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import '../styles/auth.css'
import axios from 'axios'
import { API_URL } from '../config/api'
import { useRateLimiter } from '../hooks/useRateLimiter'

const FoodPartnerLogin = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    // Use a unique key for Partner Login
    const { isLocked, timeLeft, handleRateLimitError, formatTime } = useRateLimiter('lockout_partner_login');

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLocked || loading) return;
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_URL}/api/auth/food-partner/login`, {
                email,
                password
            }, {withCredentials: true});

            setEmail('');
            setPassword('');

            navigate('/create-food');
        } catch (error) {
            console.error("Login failed:", error);
            const rateLimitMsg = handleRateLimitError(error);
            if (rateLimitMsg) {
                setError(rateLimitMsg);
            } else {
                setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='auth-container'>
            <div className='auth-card'>
                <div className='auth-header'>
                    <h2>Partner Login</h2>
                    <p>Access your restaurant dashboard</p>
                </div>
                <form className='auth-form'
                    onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label className='form-label' htmlFor='email'>Business Email</label>
                        <input type='email' id='email' className='form-input' placeholder='Enter business email' required
                            value={email}
                            onChange={
                                (e) => setEmail(e.target.value)
                            }
                            disabled={isLocked || loading}
                        />
                    </div>
                    <div className='form-group'>
                        <label className='form-label' htmlFor='password'>Password</label>
                        <input type='password' id='password' className='form-input' placeholder='Enter password' required
                            value={password}
                            onChange={
                                (e) => setPassword(e.target.value)
                            }
                            disabled={isLocked || loading}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button 
                        type='submit' 
                        className='submit-btn'
                        disabled={isLocked || loading}
                        style={isLocked ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
                    >
                        {isLocked ? `Try again in ${formatTime(timeLeft)}` : (loading ? 'Logging in...' : 'Login to Dashboard')}
                    </button>
                </form>
                <div className='auth-footer'>
                    <p>
                        New to our platform?
                        <Link to='/food-partner/register' className='auth-link'>Register Partner</Link>
                    </p>
                    <p style={
                        {marginTop: '10px'}
                    }>
                        Not a partner?
                        <Link to='/user/login' className='auth-link'>User Login</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FoodPartnerLogin
