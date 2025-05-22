import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';


export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    axios.defaults.baseURL = 'http://localhost:5000/api';
    axios.defaults.withCredentials = true;

    // Axios interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        // Avoid trying refresh token for auth endpoints
        const excludedUrls = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
        if (excludedUrls.some(url => originalRequest.url.includes(url))) {
            return Promise.reject(error);
        }

        // If error is 401 and not already retried
        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/refresh-token'
        ) {
            originalRequest._retry = true;

            try {
                const { data } = await axios.post('/auth/refresh-token');

                if (data.success) {
                    return axios(originalRequest);
                }
            } catch (refreshError) {
    logout(true); // Silent logout — no toast

    return Promise.reject(refreshError);
}

        }

        return Promise.reject(error);
    }
);


    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/auth/me');
                if (data.success) {
                    setCurrentUser(data.data);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                if (error.response) {
                    console.error('Error status:', error.response.status);
                }
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    // Register user
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.post('/auth/register', userData);

            if (data.success) {
                setCurrentUser(data.admin);
                toast.success('Registration successful!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            setError(message);
            toast.error(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async ({ email, password, rememberMe }) => {
    try {
        setLoading(true);
        const { data } = await axios.post('/auth/login', { email, password });

        if (data.success) {
            setCurrentUser(data.admin);
            toast.success('Login successful');
            return { success: true };
        }
    } catch (err) {
        const message = err.response?.data?.message || 'Login failed';
        toast.error(message);
        return { success: false };
    } finally {
        setLoading(false);
    }
};


    // Logout user
   const logout = async (silent = false) => {
    try {
        setLoading(true);
        await axios.get('/auth/logout');
        setCurrentUser(null);
        if (!silent) {
            toast.info('Logged out successfully');
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        setLoading(false);
    }
};


    // Change password
    const changePassword = async (passwordData) => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.put('/auth/change-password', passwordData);

            if (data.success) {
                toast.success('Password changed successfully!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password';
            setError(message);
            toast.error(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.post('/auth/forgot-password', { email });

            if (data.success) {
                toast.success('Password reset email sent!');
                return { success: true, resetToken: data.resetToken };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send reset email';
            setError(message);
            toast.error(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    // Reset password
    const resetPassword = async (resetToken, password) => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.put(`/auth/reset-password/${resetToken}`, { password });

            if (data.success) {
                setCurrentUser(data.admin);
                toast.success('Password reset successful!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reset password';
            setError(message);
            toast.error(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                loading,
                error,
                register,
                login,
                logout,
                changePassword,
                forgotPassword,
                resetPassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

AuthProvider.propTypes = {
        children: PropTypes.node.isRequired,
    };