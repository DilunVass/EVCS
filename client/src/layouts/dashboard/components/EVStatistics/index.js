import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import MiniStatisticsCard from 'examples/Cards/StatisticsCards/MiniStatisticsCard';
import { IoFlash, IoTime, IoStatsChart } from 'react-icons/io5';
import { FaChargingStation } from 'react-icons/fa';
import api from 'layouts/stations/api';

const EVStatistics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/analytics');
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} xl={3}>
          <MiniStatisticsCard
            title={{ text: "loading...", fontWeight: "regular" }}
            count="..."
            percentage={{ color: "info", text: "Loading" }}
            icon={{ color: "info", component: <FaChargingStation size="22px" color="white" /> }}
          />
        </Grid>
        {/* Repeat for other cards */}
      </Grid>
    );
  }

  const completionRate = analytics.total_sessions > 0 
    ? ((analytics.completed_sessions / analytics.total_sessions) * 100).toFixed(1)
    : 0;

  const activePercentage = analytics.total_sessions > 0
    ? ((analytics.active_sessions / analytics.total_sessions) * 100).toFixed(1)
    : 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} xl={3}>
        <MiniStatisticsCard
          title={{ text: "active sessions", fontWeight: "regular" }}
          count={analytics.active_sessions.toString()}
          percentage={{ 
            color: analytics.active_sessions > 0 ? "success" : "secondary", 
            text: `${activePercentage}% of total` 
          }}
          icon={{ color: "info", component: <FaChargingStation size="22px" color="white" /> }}
        />
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <MiniStatisticsCard
          title={{ text: "total sessions", fontWeight: "regular" }}
          count={analytics.total_sessions.toString()}
          percentage={{ 
            color: "success", 
            text: `${completionRate}% completed` 
          }}
          icon={{ color: "info", component: <IoStatsChart size="22px" color="white" /> }}
        />
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <MiniStatisticsCard
          title={{ text: "energy consumed", fontWeight: "regular" }}
          count={`${analytics.total_energy_consumed.toFixed(1)} kWh`}
          percentage={{ 
            color: "success", 
            text: `$${analytics.total_revenue.toFixed(2)} revenue` 
          }}
          icon={{ color: "info", component: <IoFlash size="22px" color="white" /> }}
        />
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <MiniStatisticsCard
          title={{ text: "avg session time", fontWeight: "regular" }}
          count={
            analytics.average_session_duration 
              ? `${analytics.average_session_duration.toFixed(1)} min`
              : "N/A"
          }
          percentage={{ 
            color: "info", 
            text: `${analytics.completed_sessions} completed` 
          }}
          icon={{ color: "info", component: <IoTime size="22px" color="white" /> }}
        />
      </Grid>
    </Grid>
  );
};

export default EVStatistics;