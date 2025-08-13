// @mui material components
// @mui icons
import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Box from "@mui/material/Box";

// Images
import team1 from "assets/images/avatar1.png";
import team2 from "assets/images/avatar2.png";
import team3 from "assets/images/avatar3.png";
import team4 from "assets/images/avatar4.png";
import profile1 from "assets/images/profile-1.png";
import profile2 from "assets/images/profile-2.png";
import profile3 from "assets/images/profile-3.png";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

// Overview page components
import Header from "layouts/profile/components/Header";
import { useState, useEffect } from "react";

// API import
import { getUserProfile } from "layouts/stations/api";
import api from "layouts/stations/api";

function Overview() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileResponse, analyticsResponse, sessionsResponse] = await Promise.all([
          getUserProfile(),
          api.get('/api/analytics'),
          api.get('/api/sessions')
        ]);
        setUserProfile(profileResponse);
        setAnalytics(analyticsResponse.data);
        setSessions(sessionsResponse.data.slice(0, 5)); // Show last 5 sessions
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getVehicleImage = (index) => {
    const images = [profile1, profile2, profile3];
    return images[index % images.length];
  };

  const getVehicleTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'electric':
        return <ElectricCarIcon sx={{ color: '#4fd1c7' }} />;
      case 'hybrid':
        return <BatteryChargingFullIcon sx={{ color: '#ffa726' }} />;
      default:
        return <ElectricCarIcon sx={{ color: '#4fd1c7' }} />;
    }
  };

  const getVehicleTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'electric':
        return 'success';
      case 'hybrid':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Analytics helper functions
  const getMetricCard = (title, value, icon, color, trend) => (
    <Card sx={{ height: "100%", background: "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)" }}>
      <VuiBox p={2}>
        <VuiBox display="flex" justifyContent="space-between" alignItems="center">
          <VuiBox>
            <VuiTypography variant="caption" color="text" fontWeight="medium">
              {title}
            </VuiTypography>
            <VuiTypography variant="h4" color="white" fontWeight="bold">
              {value}
            </VuiTypography>
            {trend && (
              <VuiBox display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon sx={{ fontSize: 16, color: color, mr: 0.5 }} />
                <VuiTypography variant="caption" color={color} fontWeight="medium">
                  {trend}
                </VuiTypography>
              </VuiBox>
            )}
          </VuiBox>
          <VuiBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="48px"
            height="48px"
            borderRadius="12px"
            sx={{ backgroundColor: `${color}20` }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
          </VuiBox>
        </VuiBox>
      </VuiBox>
    </Card>
  );

  // Simple bar chart using CSS and LinearProgress
  const SimpleBarChart = ({ data, color = "#4fd1c7" }) => {
    const maxValue = Math.max(...data.map(d => d.energy));
    
    return (
      <VuiBox>
        {data.map((item, index) => (
          <VuiBox key={index} mb={2}>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <VuiTypography variant="caption" color="text">
                {item.name}
              </VuiTypography>
              <VuiTypography variant="caption" color="white" fontWeight="medium">
                {item.energy.toFixed(1)} kWh
              </VuiTypography>
            </VuiBox>
            <LinearProgress
              variant="determinate"
              value={(item.energy / maxValue) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 4,
                },
              }}
            />
          </VuiBox>
        ))}
      </VuiBox>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <VuiBox p={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </VuiBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <VuiBox p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <VuiButton 
            variant="contained" 
            color="info"
            onClick={() => window.location.reload()}
          >
            Retry
          </VuiButton>
        </VuiBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header />
      
      {/* Main Content Container */}
      <VuiBox mt={5} mb={3}>
        <Grid container spacing={3}>
          
          {/* Left Column - Profile Info */}
          <Grid item xs={12} lg={4}>
            <ProfileInfoCard
              title="Profile Information"
              description={`Welcome ${userProfile?.username || 'User'}! Manage your electric vehicle charging efficiently with our EVCS platform.`}
              info={{
                "Full Name": userProfile?.username || "Not available",
                "Email": userProfile?.email || "Not available",
                "User ID": userProfile?.id || "Not available",
                "Vehicles": `${userProfile?.vehicles?.length || 0} vehicle(s)`,
                "Member Since": new Date(userProfile?.createdAt || Date.now()).toLocaleDateString(),
              }}
              social={[
                {       
                  icon: <FacebookIcon />,
                  color: "facebook",
                },
                {      
                  icon: <TwitterIcon />,
                  color: "twitter",
                },
                {
                  icon: <InstagramIcon />,
                  color: "instagram",
                },
              ]}
              action={{
                route: "/profile/edit",
                tooltip: "Edit Profile",
                icon: <EditIcon />,
              }}
            />
          </Grid>

          {/* Right Column - Analytics Dashboard */}
          <Grid item xs={12} lg={8}>
            <VuiBox>
              {/* Analytics Header */}
              <VuiBox mb={3}>
                <VuiTypography color="white" variant="lg" fontWeight="bold" mb="6px">
                  Charging Analytics
                </VuiTypography>
                <VuiTypography color="text" variant="button" fontWeight="regular" mb={3}>
                  Your charging statistics and energy consumption overview
                </VuiTypography>
              </VuiBox>
              
              {/* Metrics Cards Row */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} lg={3}>
                  {getMetricCard(
                    "Total Sessions",
                    analytics?.totalSessions || sessions.length || 0,
                    <BarChartIcon />,
                    "#4fd1c7",
                    "+12% this month"
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  {getMetricCard(
                    "Energy Consumed",
                    `${analytics?.totalEnergy || sessions.reduce((sum, s) => sum + (s.energy_consumed || 0), 0).toFixed(1)} kWh`,
                    <FlashOnIcon />,
                    "#ffa726",
                    "+8% this month"
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  {getMetricCard(
                    "Total Cost",
                    `$${analytics?.totalCost || sessions.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}`,
                    <AttachMoneyIcon />,
                    "#f44336",
                    "+5% this month"
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  {getMetricCard(
                    "Avg. Session",
                    `${analytics?.avgSessionDuration || '25'} min`,
                    <TrendingUpIcon />,
                    "#9c27b0",
                    "-3% this month"
                  )}
                </Grid>
              </Grid>

              {/* Charts and Sessions Row */}
              <Grid container spacing={3}>
                {/* Energy Consumption Chart - Reduced size */}
                <Grid item xs={12} xl={6}>
                  <Card sx={{ height: "100%" }}>
                    <VuiBox p={3}>
                      <VuiTypography color="white" variant="lg" fontWeight="bold" mb={3}>
                        Energy Consumption Trend
                      </VuiTypography>
                      <VuiBox height="350px" display="flex" alignItems="center">
                        <SimpleBarChart 
                          data={sessions.map((session, index) => ({
                            name: `Session ${index + 1}`,
                            energy: session.energy_consumed || 0
                          }))}
                          color="#4fd1c7"
                        />
                      </VuiBox>
                    </VuiBox>
                  </Card>
                </Grid>

                {/* Recent Sessions - Increased size */}
                <Grid item xs={12} xl={6}>
                  <Card sx={{ height: "100%" }}>
                    <VuiBox p={3}>
                      <VuiTypography color="white" variant="lg" fontWeight="bold" mb={3}>
                        Recent Sessions
                      </VuiTypography>
                      <VuiBox sx={{ maxHeight: "350px", overflowY: "auto" }}>
                        {sessions.length > 0 ? (
                          sessions.map((session, index) => (
                            <VuiBox 
                              key={index}
                              display="flex" 
                              justifyContent="space-between" 
                              alignItems="center" 
                              mb={2}
                              p={2}
                              sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                            >
                              <VuiBox>
                                <VuiTypography variant="button" color="white" fontWeight="medium">
                                  {session.energy_consumed?.toFixed(1) || 'N/A'} kWh
                                </VuiTypography>
                                <VuiTypography variant="caption" color="text" display="block">
                                  {new Date(session.start_time).toLocaleDateString()}
                                </VuiTypography>
                              </VuiBox>
                              <VuiBox textAlign="right">
                                <VuiTypography variant="button" color="success" fontWeight="bold">
                                  ${session.cost?.toFixed(2) || '0.00'}
                                </VuiTypography>
                                <Chip
                                  label={session.status || 'completed'}
                                  size="small"
                                  color={session.status === 'completed' ? 'success' : 'default'}
                                  sx={{ ml: 1, fontSize: '0.7rem' }}
                                />
                              </VuiBox>
                            </VuiBox>
                          ))
                        ) : (
                          <VuiBox textAlign="center" py={4}>
                            <ElectricCarIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                            <VuiTypography color="text" variant="button">
                              No charging sessions yet
                            </VuiTypography>
                          </VuiBox>
                        )}
                      </VuiBox>
                    </VuiBox>
                  </Card>
                </Grid>
              </Grid>
            </VuiBox>
          </Grid>
        </Grid>
      </VuiBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
