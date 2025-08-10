import React, { useState, useEffect } from 'react';
import { Card, Grid, CircularProgress } from '@mui/material';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiProgress from 'components/VuiProgress';
import { IoFlash, IoTime, IoCash, IoStatsChart } from 'react-icons/io5';
import { FaChargingStation, FaCar } from 'react-icons/fa';
import api from 'layouts/stations/api';

const EVAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/analytics');
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <VuiBox p={3} display="flex" alignItems="center" justifyContent="center" height="400px">
          <CircularProgress />
        </VuiBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <VuiBox p={3}>
          <VuiTypography variant="lg" color="error" fontWeight="bold" mb="5px">
            Error Loading Analytics
          </VuiTypography>
          <VuiTypography variant="button" color="text">
            {error}
          </VuiTypography>
        </VuiBox>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const completionRate = analytics.total_sessions > 0 
    ? (analytics.completed_sessions / analytics.total_sessions) * 100 
    : 0;

  const activeRate = analytics.total_sessions > 0 
    ? (analytics.active_sessions / analytics.total_sessions) * 100 
    : 0;

  return (
    <Card>
      <VuiBox p={3}>
        <VuiTypography variant="lg" color="white" fontWeight="bold" mb="5px">
          EV Charging Analytics
        </VuiTypography>
        <VuiBox display="flex" alignItems="center" mb="40px">
          <VuiTypography variant="button" color="success" fontWeight="bold">
            Real-time{" "}
            <VuiTypography variant="button" color="text" fontWeight="regular">
              charging station metrics
            </VuiTypography>
          </VuiTypography>
        </VuiBox>
        
        <Grid container spacing={3}>
          {/* Total Sessions */}
          <Grid item xs={12} md={6} lg={4}>
            <VuiBox mb={3}>
              <VuiBox display="flex" alignItems="center" mb="8px">
                <VuiBox
                  bgColor="info"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                >
                  <FaCar color="#fff" size="12px" />
                </VuiBox>
                <VuiTypography color="text" variant="button" fontWeight="medium">
                  Total Sessions
                </VuiTypography>
              </VuiBox>
              <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                {analytics.total_sessions}
              </VuiTypography>
              <VuiProgress 
                value={Math.min(analytics.total_sessions * 10, 100)} 
                color="info" 
                sx={{ background: "#2D2E5F" }} 
              />
            </VuiBox>
          </Grid>

          {/* Active Sessions */}
          <Grid item xs={12} md={6} lg={4}>
            <VuiBox mb={3}>
              <VuiBox display="flex" alignItems="center" mb="8px">
                <VuiBox
                  bgColor="success"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                >
                  <FaChargingStation color="#fff" size="12px" />
                </VuiBox>
                <VuiTypography color="text" variant="button" fontWeight="medium">
                  Active Now
                </VuiTypography>
              </VuiBox>
              <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                {analytics.active_sessions}
              </VuiTypography>
              <VuiProgress 
                value={activeRate} 
                color="success" 
                sx={{ background: "#2D2E5F" }} 
              />
            </VuiBox>
          </Grid>

          {/* Completed Sessions */}
          <Grid item xs={12} md={6} lg={4}>
            <VuiBox mb={3}>
              <VuiBox display="flex" alignItems="center" mb="8px">
                <VuiBox
                  bgColor="warning"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                >
                  <IoStatsChart color="#fff" size="12px" />
                </VuiBox>
                <VuiTypography color="text" variant="button" fontWeight="medium">
                  Completed
                </VuiTypography>
              </VuiBox>
              <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                {analytics.completed_sessions}
              </VuiTypography>
              <VuiProgress 
                value={completionRate} 
                color="warning" 
                sx={{ background: "#2D2E5F" }} 
              />
            </VuiBox>
          </Grid>

          {/* Total Energy Consumed */}
          <Grid item xs={12} md={6} lg={4}>
            <VuiBox mb={3}>
              <VuiBox display="flex" alignItems="center" mb="8px">
                <VuiBox
                  bgColor="error"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                >
                  <IoFlash color="#fff" size="12px" />
                </VuiBox>
                <VuiTypography color="text" variant="button" fontWeight="medium">
                  Energy Used
                </VuiTypography>
              </VuiBox>
              <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                {analytics.total_energy_consumed.toFixed(1)} kWh
              </VuiTypography>
              <VuiProgress 
                value={Math.min(analytics.total_energy_consumed / 50, 100)} 
                color="error" 
                sx={{ background: "#2D2E5F" }} 
              />
            </VuiBox>
          </Grid>

          {/* Total Revenue */}
          <Grid item xs={12} md={6} lg={4}>
            <VuiBox mb={3}>
              <VuiBox display="flex" alignItems="center" mb="8px">
                <VuiBox
                  bgColor="secondary"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                >
                  <IoCash color="#fff" size="12px" />
                </VuiBox>
                <VuiTypography color="text" variant="button" fontWeight="medium">
                  Revenue
                </VuiTypography>
              </VuiBox>
              <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                ${analytics.total_revenue.toFixed(2)}
              </VuiTypography>
              <VuiProgress 
                value={Math.min(analytics.total_revenue / 50, 100)} 
                color="secondary" 
                sx={{ background: "#2D2E5F" }} 
              />
            </VuiBox>
          </Grid>

          {/* Average Session Duration */}
          <Grid item xs={12} md={6} lg={4}>
            <VuiBox mb={3}>
              <VuiBox display="flex" alignItems="center" mb="8px">
                <VuiBox
                  bgColor="dark"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                >
                  <IoTime color="#fff" size="12px" />
                </VuiBox>
                <VuiTypography color="text" variant="button" fontWeight="medium">
                  Avg Duration
                </VuiTypography>
              </VuiBox>
              <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                {analytics.average_session_duration ? 
                  `${analytics.average_session_duration.toFixed(1)} min` : 
                  'N/A'
                }
              </VuiTypography>
              <VuiProgress 
                value={analytics.average_session_duration ? 
                  Math.min(analytics.average_session_duration * 2, 100) : 0
                } 
                color="dark" 
                sx={{ background: "#2D2E5F" }} 
              />
            </VuiBox>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <VuiBox mt={3} p={2} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <VuiTypography variant="button" color="text" fontWeight="medium">
                Most Used Station:
              </VuiTypography>
              <VuiTypography variant="button" color="white" fontWeight="bold" ml={1}>
                {analytics.most_used_station || 'No data'}
              </VuiTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <VuiTypography variant="button" color="text" fontWeight="medium">
                Peak Usage Hour:
              </VuiTypography>
              <VuiTypography variant="button" color="white" fontWeight="bold" ml={1}>
                {analytics.peak_usage_hour ? 
                  `${analytics.peak_usage_hour}:00` : 
                  'No data'
                }
              </VuiTypography>
            </Grid>
          </Grid>
        </VuiBox>
      </VuiBox>
    </Card>
  );
};

export default EVAnalytics;