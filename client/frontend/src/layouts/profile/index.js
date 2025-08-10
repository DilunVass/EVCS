// @mui material components
// @mui icons
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
import PlatformSettings from "layouts/profile/components/PlatformSettings";
import Welcome from "./components/Welcome/index";
import CarInformations from "./components/CarInformations";
import { useState, useEffect } from "react";

function Overview() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch('https://fastapi-app-121646825275.us-central1.run.app/protected/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else {
          setError('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
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
      <VuiBox mt={5} mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} xl={5} xxl={6}>
            <CarInformations vehicles={userProfile?.vehicles || []} />
          </Grid>
          <Grid item xs={12} xl={3} xxl={3}>
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
        </Grid>
      </VuiBox>

      <Grid container spacing={3} mb="30px">
        <Grid item xs={12} xl={3} height="100%">
          <PlatformSettings />
        </Grid>
        <Grid item xs={12} xl={9}>
          <Card sx={{ height: "100%" }}>
            <VuiBox display="flex" flexDirection="column" height="100%" p={3}>
              <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <VuiBox>
                  <VuiTypography color="white" variant="lg" fontWeight="bold" mb="6px">
                    Vehicle Fleet
                  </VuiTypography>
                  <VuiTypography color="text" variant="button" fontWeight="regular">
                    Manage your registered vehicles and charging history
                  </VuiTypography>
                </VuiBox>
                <VuiButton
                  variant="contained"
                  color="info"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Add Vehicle
                </VuiButton>
              </VuiBox>

              {userProfile?.vehicles?.length > 0 ? (
                <Grid container spacing={3}>
                  {userProfile.vehicles.map((vehicle, index) => (
                    <Grid item xs={12} md={6} xl={4} key={index}>
                      <DefaultProjectCard
                        image={getVehicleImage(index)}
                        label={
                          <Chip
                            icon={getVehicleTypeIcon(vehicle.vehicleType)}
                            label={vehicle.vehicleType || 'Electric'}
                            color={getVehicleTypeColor(vehicle.vehicleType)}
                            size="small"
                            variant="outlined"
                          />
                        }
                        title={vehicle.vehicleNumber || `Vehicle #${index + 1}`}
                        description={
                          <VuiBox>
                            <VuiTypography variant="caption" color="text" mb={1}>
                              Battery: {vehicle.batteryCapacity || 'N/A'}kWh | 
                              Max Charge: {vehicle.maxChargeRate || 'N/A'}kW
                            </VuiTypography>
                            {vehicle.batteryLevel && (
                              <VuiBox>
                                <VuiTypography variant="caption" color="text" mb={0.5}>
                                  Battery Level: {vehicle.batteryLevel}%
                                </VuiTypography>
                                <LinearProgress
                                  variant="determinate"
                                  value={vehicle.batteryLevel}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: vehicle.batteryLevel > 50 ? '#4fd1c7' : '#ffa726',
                                    },
                                  }}
                                />
                              </VuiBox>
                            )}
                          </VuiBox>
                        }
                        action={{
                          type: "internal",
                          route: `/vehicles/${vehicle.id || index}`,
                          color: "white",
                          label: "VIEW DETAILS",
                        }}
                        authors={[
                          { 
                            image: team1, 
                            name: `${vehicle.chargingHistory?.length || 0} charges` 
                          },
                          { 
                            image: team2, 
                            name: `${vehicle.totalKwh || 0} kWh` 
                          },
                        ]}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <VuiBox 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  py={6}
                >
                  <ElectricCarIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                  <VuiTypography color="text" variant="h6" mb={1}>
                    No vehicles registered yet
                  </VuiTypography>
                  <VuiTypography color="text" variant="button" textAlign="center" mb={3}>
                    Add your first electric vehicle to start tracking your charging sessions
                  </VuiTypography>
                  <VuiButton
                    variant="contained"
                    color="info"
                    startIcon={<AddIcon />}
                  >
                    Add Your First Vehicle
                  </VuiButton>
                </VuiBox>
              )}
            </VuiBox>
          </Card>
        </Grid>
      </Grid>

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
