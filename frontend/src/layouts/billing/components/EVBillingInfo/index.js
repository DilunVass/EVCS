import React, { useState, useEffect } from 'react';
import { Card, Grid, Chip } from '@mui/material';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiButton from 'components/VuiButton';
import { IoFlash, IoTime, IoStatsChart, IoCash } from 'react-icons/io5';
import { FaChargingStation, FaCar } from 'react-icons/fa';
import api from 'layouts/stations/api';

const EVBillingInfo = () => {
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsResponse, sessionsResponse] = await Promise.all([
          api.get('/api/analytics'),
          api.get('/api/sessions')
        ]);
        setAnalytics(analyticsResponse.data);
        setSessions(sessionsResponse.data.slice(0, 5)); // Show last 5 sessions
      } catch (err) {
        console.error('Error fetching billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'info';
      case 'interrupted':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <VuiBox p={3}>
          <VuiTypography variant="lg" color="white" fontWeight="bold">
            Loading billing information...
          </VuiTypography>
        </VuiBox>
      </Card>
    );
  }

  return (
    <Card>
      <VuiBox p={3}>
        <VuiBox display="flex" alignItems="center" mb="20px">
          <IoStatsChart size="20px" color="white" />
          <VuiTypography variant="lg" color="white" fontWeight="bold" ml={1}>
            EV Charging Summary
          </VuiTypography>
        </VuiBox>
        
        {/* Billing Summary */}
        {analytics && (
          <VuiBox mb={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <VuiBox p={2} sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                  <VuiBox display="flex" alignItems="center" mb={1}>
                    <IoCash size="16px" color="#3b82f6" />
                    <VuiTypography variant="button" color="info" fontWeight="bold" ml={1}>
                      Total Spent
                    </VuiTypography>
                  </VuiBox>
                  <VuiTypography variant="h5" color="white" fontWeight="bold">
                    ${analytics.total_revenue.toFixed(2)}
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text">
                    From {analytics.total_sessions} charging sessions
                  </VuiTypography>
                </VuiBox>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <VuiBox p={2} sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                  <VuiBox display="flex" alignItems="center" mb={1}>
                    <IoFlash size="16px" color="#10b981" />
                    <VuiTypography variant="button" color="success" fontWeight="bold" ml={1}>
                      Energy Used
                    </VuiTypography>
                  </VuiBox>
                  <VuiTypography variant="h5" color="white" fontWeight="bold">
                    {analytics.total_energy_consumed.toFixed(1)} kWh
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text">
                    Average {analytics.average_session_duration.toFixed(1)} min/session
                  </VuiTypography>
                </VuiBox>
              </Grid>
            </Grid>
          </VuiBox>
        )}
        
        {/* Recent Sessions */}
        <VuiBox mb={3}>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <VuiTypography variant="button" color="white" fontWeight="bold">
              Recent Charging Sessions
            </VuiTypography>
            <VuiButton variant="outlined" color="info" size="small">
              View All
            </VuiButton>
          </VuiBox>
          
          <VuiBox>
            {sessions.length === 0 ? (
              <VuiBox textAlign="center" py={3}>
                <VuiTypography variant="button" color="text">
                  No charging sessions found
                </VuiTypography>
              </VuiBox>
            ) : (
              sessions.map((session) => (
                <VuiBox key={session.id} mb={2} p={2} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <VuiBox display="flex" alignItems="center">
                      <FaCar size="14px" color="#6b7280" />
                      <VuiTypography variant="button" color="white" fontWeight="medium" ml={1}>
                        {session.vehicle_number}
                      </VuiTypography>
                    </VuiBox>
                    
                    <Chip 
                      label={session.status.toUpperCase()}
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(session.status) === 'success' ? '#16a34a' : 
                                         getStatusColor(session.status) === 'info' ? '#3b82f6' : 
                                         getStatusColor(session.status) === 'warning' ? '#f59e0b' : '#ef4444',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </VuiBox>
                  
                  <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <VuiBox display="flex" alignItems="center">
                      <FaChargingStation size="12px" color="#6b7280" />
                      <VuiTypography variant="caption" color="text" ml={0.5}>
                        Station {session.station_id}, Slot {session.slot_id}
                      </VuiTypography>
                    </VuiBox>
                    
                    <VuiTypography variant="button" color="success" fontWeight="bold">
                      ${session.cost ? session.cost.toFixed(2) : '0.00'}
                    </VuiTypography>
                  </VuiBox>
                  
                  <VuiBox display="flex" justifyContent="space-between" alignItems="center">
                    <VuiBox display="flex" alignItems="center">
                      <IoFlash size="12px" color="#f59e0b" />
                      <VuiTypography variant="caption" color="text" ml={0.5}>
                        {session.initial_charge_level}% → {session.final_charge_level || session.current_charge_level}%
                      </VuiTypography>
                    </VuiBox>
                    
                    <VuiTypography variant="caption" color="text">
                      {formatDate(session.start_time)}
                    </VuiTypography>
                  </VuiBox>
                  
                  {session.energy_consumed && (
                    <VuiBox display="flex" alignItems="center" mt={1}>
                      <IoTime size="12px" color="#6b7280" />
                      <VuiTypography variant="caption" color="text" ml={0.5}>
                        {session.energy_consumed.toFixed(2)} kWh consumed
                      </VuiTypography>
                    </VuiBox>
                  )}
                </VuiBox>
              ))
            )}
          </VuiBox>
        </VuiBox>
        
        {/* Payment Methods */}
        <VuiBox>
          <VuiTypography variant="button" color="white" fontWeight="bold" mb={2}>
            Payment Methods
          </VuiTypography>
          
          <VuiBox p={2} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center">
              <VuiBox>
                <VuiTypography variant="button" color="white" fontWeight="medium">
                  VISA •••• 5890
                </VuiTypography>
                <VuiTypography variant="caption" color="text" display="block">
                  Expires 09/2026
                </VuiTypography>
              </VuiBox>
              
              <Chip 
                label="DEFAULT"
                size="small"
                sx={{ 
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </VuiBox>
          </VuiBox>
          
          <VuiBox mt={2}>
            <VuiButton variant="outlined" color="info" size="small" fullWidth>
              Add Payment Method
            </VuiButton>
          </VuiBox>
        </VuiBox>
      </VuiBox>
    </Card>
  );
};

export default EVBillingInfo;