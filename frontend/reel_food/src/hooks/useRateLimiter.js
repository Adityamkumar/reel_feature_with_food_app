import {useState, useEffect} from 'react';

export const useRateLimiter = (storageKey = 'auth_global_lockout') => {
    const [lockoutTime, setLockoutTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const storedExpiry = localStorage.getItem(storageKey);
        if (storedExpiry) {
            const expiry = parseInt(storedExpiry, 10);
            if (expiry > Date.now()) {
                setLockoutTime(expiry);
                setTimeLeft(Math.ceil((expiry - Date.now()) / 1000));
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [storageKey]);

    // Timer logic
    useEffect(() => {
        if (!lockoutTime) 
            return;
        

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.ceil((lockoutTime - now) / 1000);

            if (diff <= 0) {
                setLockoutTime(null);
                setTimeLeft(0);
                localStorage.removeItem(storageKey);
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return() => clearInterval(interval);
    }, [lockoutTime, storageKey]);

    const handleRateLimitError = (error) => {
        if (error.response ?. status === 429) {
            const waitTime = 15 * 60; // 15 mins default
            const expiry = Date.now() + waitTime * 1000;
            setLockoutTime(expiry);
            setTimeLeft(waitTime);
            localStorage.setItem(storageKey, expiry);
            return error.response ?. data ?. message || "Too many attempts. Try again in 15 minutes.";
        }
        return null; // Not a rate limit error
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${
            s < 10 ? '0' : ''
        }${s}`;
    };

    return {
        lockoutTime,
        timeLeft,
        handleRateLimitError,
        formatTime,
        isLocked: !!lockoutTime
    };
};
