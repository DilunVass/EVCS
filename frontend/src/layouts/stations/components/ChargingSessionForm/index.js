import React, { useState, useEffect } from 'react';
import api from '../../api';

const ChargingSessionForm = ({ stations, onAddSession, onCancel }) => {
  const [formData, setFormData] = useState({
    station_id: '',
    slot_id: 0,
    user_id: '',
    vehicle_number: '',
    initial_charge_level: 50
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authStatus, setAuthStatus] = useState('checking');
  const [authenticatedUserId, setAuthenticatedUserId] = useState('');

  // Get user ID from token or set default
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setLoadingUser(true);
        const token = localStorage.getItem('access_token');
        
        if (token) {
          try {
            // Verify token with backend
            const response = await api.get('/auth/me');
            if (response.data && response.data.id) {
              const userId = response.data.id;
              setAuthenticatedUserId(userId);
              setFormData(prev => ({ ...prev, user_id: userId }));
              setAuthStatus('authenticated');
            } else {
              throw new Error('No user data');
            }
          } catch (error) {
            console.log('Token verification failed:', error);
            // Try to decode token locally as fallback
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              
              const tokenData = JSON.parse(jsonPayload);
              const userId = tokenData.user_id || tokenData.sub || tokenData.id || tokenData.userId;
              
              if (userId) {
                setAuthenticatedUserId(userId);
                setFormData(prev => ({ ...prev, user_id: userId }));
                setAuthStatus('authenticated');
              } else {
                throw new Error('No user ID in token');
              }
            } catch (tokenError) {
              console.log('Could not decode token');
              localStorage.removeItem('access_token');
              setAuthStatus('not-authenticated');
              setAuthenticatedUserId('');
            }
          }
        } else {
          setAuthStatus('not-authenticated');
          setAuthenticatedUserId('');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        setAuthStatus('not-authenticated');
        setAuthenticatedUserId('');
      } finally {
        setLoadingUser(false);
      }
    };

    getCurrentUser();
  }, []);

  const handleLogin = async () => {
    try {
      setLoadingUser(true);
      
      // Try demo login
      const response = await api.post('/auth/demo-login');
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        const userId = response.data.user_id;
        setAuthenticatedUserId(userId);
        setFormData(prev => ({ ...prev, user_id: userId }));
        setAuthStatus('authenticated');
      }
    } catch (error) {
      console.error('Demo login failed:', error);
      
      // Try regular login with demo credentials
      try {
        const loginResponse = await api.post('/auth/login', {
          username: 'demo_user',
          password: 'demo_password'
        });
        
        if (loginResponse.data && loginResponse.data.access_token) {
          localStorage.setItem('access_token', loginResponse.data.access_token);
          const userId = loginResponse.data.user_id;
          setAuthenticatedUserId(userId);
          setFormData(prev => ({ ...prev, user_id: userId }));
          setAuthStatus('authenticated');
        }
      } catch (loginError) {
        console.error('Login failed:', loginError);
        alert('Login failed. Please try again.');
      }
    } finally {
      setLoadingUser(false);
    }
  };

  const selectedStation = stations.find(station => station.id === formData.station_id);
  const availableSlots = selectedStation ? 
    selectedStation.slots.filter(slot => slot.status === 'available') : [];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset slot when station changes
    if (name === 'station_id') {
      setFormData(prev => ({ ...prev, slot_id: 0 }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.station_id) {
      newErrors.station_id = 'Station is required';
    }

    if (!formData.slot_id) {
      newErrors.slot_id = 'Slot is required';
    }

    if (!formData.user_id.trim()) {
      newErrors.user_id = 'User ID is required';
    }

    if (!formData.vehicle_number.trim()) {
      newErrors.vehicle_number = 'Vehicle number is required';
    }

    if (formData.initial_charge_level < 0 || formData.initial_charge_level > 100) {
      newErrors.initial_charge_level = 'Initial charge level must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Make sure we have a token
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure user_id matches the authenticated user
      const sessionData = {
        ...formData,
        user_id: authenticatedUserId // Force use of authenticated user ID
      };

      console.log('Creating session with data:', sessionData);
      
      // Use the configured API instance
      const response = await api.post('/api/sessions', sessionData);
      
      if (response.data) {
        onAddSession(response.data);
        // Reset form but keep user_id
        setFormData(prev => ({
          station_id: '',
          slot_id: 0,
          user_id: authenticatedUserId, // Keep authenticated user ID
          vehicle_number: '',
          initial_charge_level: 50
        }));
      }
    } catch (error) {
      console.error('Error creating session:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Authentication failed
        setAuthStatus('not-authenticated');
        localStorage.removeItem('access_token');
        setAuthenticatedUserId('');
        alert('Authentication failed. Please login again.');
      } else if (error.response?.data?.detail) {
        alert(`Failed to create charging session: ${error.response.data.detail}`);
      } else {
        alert('Failed to create charging session. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Start Charging Session</h2>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Authentication Status */}
        {authStatus === 'not-authenticated' && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '500', color: '#92400e' }}>Authentication Required</div>
                <div style={{ fontSize: '14px', color: '#78350f' }}>Please login to create a charging session</div>
              </div>
              <button
                onClick={handleLogin}
                disabled={loadingUser}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loadingUser ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: loadingUser ? 0.6 : 1
                }}
              >
                {loadingUser ? 'Logging in...' : 'Demo Login'}
              </button>
            </div>
          </div>
        )}

        {authStatus === 'authenticated' && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #16a34a',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#16a34a', marginRight: '8px' }}>✓</span>
                <div>
                  <div style={{ fontWeight: '500', color: '#166534' }}>Authenticated</div>
                  <div style={{ fontSize: '14px', color: '#15803d' }}>User: {authenticatedUserId}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  setAuthStatus('not-authenticated');
                  setAuthenticatedUserId('');
                  setFormData(prev => ({ ...prev, user_id: '' }));
                }}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Station Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Charging Station *
              </label>
              <select
                name="station_id"
                value={formData.station_id}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.station_id ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select a station</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name} - {station.location}
                  </option>
                ))}
              </select>
              {errors.station_id && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.station_id}</span>}
            </div>

            {/* Slot Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Available Slot *
              </label>
              <select
                name="slot_id"
                value={formData.slot_id}
                onChange={handleChange}
                disabled={!selectedStation}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.slot_id ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  opacity: !selectedStation ? 0.5 : 1
                }}
              >
                <option value={0}>Select a slot</option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    Slot #{slot.id} - Available
                  </option>
                ))}
              </select>
              {errors.slot_id && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.slot_id}</span>}
              {selectedStation && availableSlots.length === 0 && (
                <span style={{ color: '#f59e0b', fontSize: '12px' }}>No available slots at this station</span>
              )}
            </div>

            {/* User ID - Now read-only when authenticated */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                User ID *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  disabled={true} // Always disabled - user can't change their own ID
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.user_id ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280'
                  }}
                  placeholder={loadingUser ? "Loading user..." : "Your user ID"}
                />
                {loadingUser && (
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    🔄
                  </div>
                )}
              </div>
              {errors.user_id && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.user_id}</span>}
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Sessions can only be created for your own account
              </div>
            </div>

            {/* Vehicle Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Vehicle Number *
              </label>
              <input
                type="text"
                name="vehicle_number"
                value={formData.vehicle_number}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.vehicle_number ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter vehicle number (e.g., ABC-123)"
              />
              {errors.vehicle_number && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.vehicle_number}</span>}
            </div>

            {/* Initial Charge Level */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Initial Charge Level (%) *
              </label>
              <input
                type="range"
                name="initial_charge_level"
                value={formData.initial_charge_level}
                onChange={handleChange}
                min="0"
                max="100"
                style={{
                  width: '100%',
                  marginBottom: '8px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="number"
                  name="initial_charge_level"
                  value={formData.initial_charge_level}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={{
                    width: '80px',
                    padding: '4px 8px',
                    border: `1px solid ${errors.initial_charge_level ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ 
                  flex: 1,
                  marginLeft: '12px',
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '16px', 
                  height: '8px' 
                }}>
                  <div style={{
                    backgroundColor: '#16a34a',
                    height: '8px',
                    borderRadius: '16px',
                    width: `${formData.initial_charge_level}%`,
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
              {errors.initial_charge_level && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.initial_charge_level}</span>}
            </div>

            {/* Station Info */}
            {selectedStation && (
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Station Details</h4>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <div>Power Output: {selectedStation.power_output}kW</div>
                  <div>Price: ${selectedStation.price_per_kwh}/kWh</div>
                  <div>Connectors: {selectedStation.connector_types.join(', ')}</div>
                  <div>Available Slots: {availableSlots.length}</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || 
                !selectedStation || 
                availableSlots.length === 0 || 
                loadingUser || 
                authStatus !== 'authenticated'
              }
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isSubmitting || !selectedStation || availableSlots.length === 0 || loadingUser || authStatus !== 'authenticated' ? '#9ca3af' : '#16a34a',
                color: 'white',
                cursor: isSubmitting || !selectedStation || availableSlots.length === 0 || loadingUser || authStatus !== 'authenticated' ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChargingSessionForm;