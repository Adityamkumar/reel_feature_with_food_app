import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/auth.css'
import axios from 'axios'
import { API_URL } from '../config/api'
import { useRateLimiter } from '../hooks/useRateLimiter'

const UserLogin = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Use a unique key for User Login to isolate the lockout
  const { isLocked, timeLeft, handleRateLimitError, formatTime } = useRateLimiter('lockout_user_login');
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
       e.preventDefault();
       if (isLocked || loading) return;
       setError('');
       setLoading(true);

      try {
          // eslint-disable-next-line no-unused-vars
          const response = await axios.post(`${API_URL}/api/auth/user/login`,{
              email,
              password
           },{
             withCredentials: true
           })

         setEmail('')
         setPassword('')    
         
         navigate('/')
      } catch (err) {
          const rateLimitMsg = handleRateLimitError(err);
          if (rateLimitMsg) {
             setError(rateLimitMsg);
          } else {
             setError(err.response?.data?.message || 'Something went wrong');
          }
      } finally {
          setLoading(false);
      }
  }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <div className='auth-header'>
          <h2>Welcome Back</h2>
          <p>Login to your account to continue</p>
        </div>
        <form className='auth-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label className='form-label' htmlFor='email'>Email Address</label>
            <input 
              type='email' 
              id='email' 
              className='form-input' 
              placeholder='Enter your email'
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLocked || loading}
            />
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='password'>Password</label>
            <input 
              type='password' 
              id='password' 
              className='form-input' 
              placeholder='Enter your password'
              autoComplete='true'
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLocked ? `Try again in ${formatTime(timeLeft)}` : (loading ? 'Logging in...' : 'Login')}
          </button>
        </form>
        <div className='auth-footer'>
          <p>
            Don't have an account? 
            <Link to='/user/register' className='auth-link'>Sign up</Link>
          </p>
          <p style={{marginTop: '10px'}}>
            Food Partner? <Link to='/food-partner/login' className='auth-link'>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserLogin
