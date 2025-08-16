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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";

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
import { getUserProfile, addUserVehicle, getUserVehicles } from "layouts/stations/api";
import api from "layouts/stations/api";

function Overview() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'electric',
    batteryCapacity: 0,
    maxChargeRate: 0,
    batteryLevel: 0,
    chargingHistory: [],
    totalKwh: 0
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const vehicleTypes = [
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'plugin-hybrid', label: 'Plugin Hybrid' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileResponse, sessionsResponse] = await Promise.all([
          getUserProfile(),
          api.get('/api/sessions')
        ]);
        
        setUserProfile(profileResponse);
        setSessions(sessionsResponse.data.slice(0, 5)); // Show last 5 sessions
        
        // Set vehicles from profile response
        setVehicles(profileResponse.vehicles || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVehicleFormChange = (event) => {
    const { name, value } = event.target;
    setVehicleFormData(prev => ({
      ...prev,
      [name]: name === 'batteryCapacity' || name === 'maxChargeRate' || name === 'batteryLevel' || name === 'totalKwh' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleAddVehicle = async () => {
    try {
      setSubmitLoading(true);
      const response = await addUserVehicle(vehicleFormData);
      
      // Refresh user profile to get updated vehicles list
      const updatedProfile = await getUserProfile();
      setUserProfile(updatedProfile);
      setVehicles(updatedProfile.vehicles || []);
      
      // Reset form and close dialog
      setVehicleFormData({
        vehicleNumber: '',
        vehicleType: 'electric',
        batteryCapacity: 0,
        maxChargeRate: 0,
        batteryLevel: 0,
        chargingHistory: [],
        totalKwh: 0
      });
      setOpenVehicleDialog(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Vehicle added successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to add vehicle',
        severity: 'error'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getVehicleImage = (index) => {
    const images = [profile1, profile2, profile3];
    return images[index % images.length];
  };

  const getVehicleTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'electric':
        return <ElectricCarIcon sx={{ color: '#4fd1c7' }} />;
      case 'hybrid':
      case 'plugin-hybrid':
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
      case 'plugin-hybrid':
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
                "Role": userProfile?.role || "User",
                "Vehicles": `${vehicles.length || 0} vehicle(s)`,
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

          {/* Right Column - Analytics Dashboard - Now Full Width */}
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
                    sessions.length || 0,
                    <BarChartIcon />,
                    "#4fd1c7",
                    "+12% this month"
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  {getMetricCard(
                    "Energy Consumed",
                    `${sessions.reduce((sum, s) => sum + (s.energy_consumed || 0), 0).toFixed(1)} kWh`,
                    <FlashOnIcon />,
                    "#ffa726",
                    "+8% this month"
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  {getMetricCard(
                    "Total Cost",
                    `$${sessions.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}`,
                    <AttachMoneyIcon />,
                    "#f44336",
                    "+5% this month"
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  {getMetricCard(
                    "Avg. Session",
                    sessions.length > 0 ? `${Math.round(sessions.reduce((sum, s) => sum + (s.duration || 25), 0) / sessions.length)} min` : "0 min",
                    <TrendingUpIcon />,
                    "#9c27b0",
                    "-3% this month"
                  )}
                </Grid>
              </Grid>

              {/* Charts and Sessions Row */}
              <Grid container spacing={3}>
                {/* My Vehicles - Replaced Energy Consumption Chart */}
                <Grid item xs={12} xl={6}>
                  <Card sx={{ height: "100%" }}>
                    <VuiBox p={3}>
                      <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <VuiTypography color="white" variant="lg" fontWeight="bold">
                          My Vehicles
                        </VuiTypography>
                        <IconButton
                          onClick={() => setOpenVehicleDialog(true)}
                          sx={{ 
                            backgroundColor: '#4fd1c7', 
                            color: 'white',
                            '&:hover': { backgroundColor: '#3ac7bc' }
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </VuiBox>
                      
                      <VuiBox sx={{ maxHeight: "350px", overflowY: "auto" }}>
                        {vehicles.length > 0 ? (
                          vehicles.map((vehicle, index) => (
                            <VuiBox 
                              key={vehicle.id || index}
                              display="flex" 
                              alignItems="center" 
                              mb={2}
                              p={2}
                              sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                            >
                              {getVehicleTypeIcon(vehicle.vehicleType)}
                              <VuiBox ml={2} flex={1}>
                                <VuiTypography variant="button" color="white" fontWeight="medium">
                                  {vehicle.vehicleNumber}
                                </VuiTypography>
                                <VuiBox display="flex" alignItems="center" mt={0.5}>
                                  <Chip
                                    label={vehicle.vehicleType}
                                    size="small"
                                    color={getVehicleTypeColor(vehicle.vehicleType)}
                                    sx={{ fontSize: '0.7rem', mr: 1 }}
                                  />
                                  <VuiTypography variant="caption" color="text">
                                    {vehicle.batteryCapacity} kWh
                                  </VuiTypography>
                                </VuiBox>
                                {vehicle.batteryLevel !== undefined && (
                                  <VuiBox mt={1}>
                                    <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                      <VuiTypography variant="caption" color="text">
                                        Battery Level
                                      </VuiTypography>
                                      <VuiTypography variant="caption" color="white" fontWeight="medium">
                                        {vehicle.batteryLevel}%
                                      </VuiTypography>
                                    </VuiBox>
                                    <LinearProgress
                                      variant="determinate"
                                      value={vehicle.batteryLevel}
                                      sx={{
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: vehicle.batteryLevel > 50 ? '#4fd1c7' : vehicle.batteryLevel > 20 ? '#ffa726' : '#f44336',
                                          borderRadius: 2,
                                        },
                                      }}
                                    />
                                  </VuiBox>
                                )}
                              </VuiBox>
                            </VuiBox>
                          ))
                        ) : (
                          <VuiBox textAlign="center" py={4}>
                            <ElectricCarIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                            <VuiTypography color="text" variant="button">
                              No vehicles added yet
                            </VuiTypography>
                            <VuiTypography color="text" variant="caption" display="block" mt={1}>
                              Click the + button to add your first vehicle
                            </VuiTypography>
                          </VuiBox>
                        )}
                      </VuiBox>
                    </VuiBox>
                  </Card>
                </Grid>

                {/* Recent Sessions */}
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
                              key={session.id || index}
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
                                  {session.start_time ? new Date(session.start_time).toLocaleDateString() : 'N/A'}
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
                            <VuiTypography color="text" variant="caption" display="block" mt={1}>
                              Start charging to see your session history
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

      {/* Add Vehicle Dialog - remains the same */}
      <Dialog 
        open={openVehicleDialog} 
        onClose={() => setOpenVehicleDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1f37',
            color: 'white',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center">
            <VuiTypography variant="h5" color="white" fontWeight="bold">
              Add New Vehicle
            </VuiTypography>
            <IconButton onClick={() => setOpenVehicleDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </VuiBox>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vehicle Number"
                name="vehicleNumber"
                value={vehicleFormData.vehicleNumber}
                onChange={handleVehicleFormChange}
                required
                placeholder="e.g., ABC-1234"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#4fd1c7' },
                    '&.Mui-focused fieldset': { borderColor: '#4fd1c7' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Vehicle Type"
                name="vehicleType"
                value={vehicleFormData.vehicleType}
                onChange={handleVehicleFormChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#4fd1c7' },
                    '&.Mui-focused fieldset': { borderColor: '#4fd1c7' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              >
                {vehicleTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Battery Capacity (kWh)"
                name="batteryCapacity"
                value={vehicleFormData.batteryCapacity}
                onChange={handleVehicleFormChange}
                inputProps={{ min: 0, step: 0.1 }}
                placeholder="e.g., 75.0"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#4fd1c7' },
                    '&.Mui-focused fieldset': { borderColor: '#4fd1c7' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Charge Rate (kW)"
                name="maxChargeRate"
                value={vehicleFormData.maxChargeRate}
                onChange={handleVehicleFormChange}
                inputProps={{ min: 0, step: 0.1 }}
                placeholder="e.g., 150.0"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#4fd1c7' },
                    '&.Mui-focused fieldset': { borderColor: '#4fd1c7' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Current Battery Level (%)"
                name="batteryLevel"
                value={vehicleFormData.batteryLevel}
                onChange={handleVehicleFormChange}
                inputProps={{ min: 0, max: 100, step: 1 }}
                placeholder="e.g., 80"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#4fd1c7' },
                    '&.Mui-focused fieldset': { borderColor: '#4fd1c7' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)' }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <VuiButton
            color="secondary"
            onClick={() => setOpenVehicleDialog(false)}
            disabled={submitLoading}
          >
            Cancel
          </VuiButton>
          <VuiButton
            color="info"
            onClick={handleAddVehicle}
            disabled={submitLoading || !vehicleFormData.vehicleNumber}
          >
            {submitLoading ? 'Adding...' : 'Add Vehicle'}
          </VuiButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications - remains the same */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
