// @mui material components
import Grid from "@mui/material/Grid";
import { Card, Box, Button, Container } from "@mui/material";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";

// Vision UI Dashboard React example components
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";

// Vision UI Dashboard React base styles
import colors from "assets/theme/base/colors";
import linearGradient from "assets/theme/functions/linearGradient";

// React icons
import { IoIosRocket } from "react-icons/io";
import { IoGlobe } from "react-icons/io5";
import { IoBuild } from "react-icons/io5";
import { IoWallet } from "react-icons/io5";
import { IoDocumentText } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import { IoLeaf } from "react-icons/io5";
import { IoShield } from "react-icons/io5";

function Landing() {
  const { gradients } = colors;
  const { cardContent } = gradients;

  return (
    <VuiBox minHeight="100vh" sx={{ backgroundColor: "#0f1419" }}>
      <DashboardNavbar />
      
      {/* Hero Section */}
      <VuiBox py={8}>
        <Container maxWidth="lg">
          <VuiBox textAlign="center" mb={6}>
            <VuiTypography 
              variant="h1" 
              color="white" 
              fontWeight="bold" 
              mb={3}
              sx={{ fontSize: { xs: "2.5rem", md: "4rem" } }}
            >
              Electric Vehicle Charging Station Digital Twin
            </VuiTypography>
            <VuiTypography 
              variant="h4" 
              color="text" 
              fontWeight="regular" 
              mb={4}
              sx={{ maxWidth: "800px", mx: "auto" }}
            >
              Power the future with our comprehensive EV charging infrastructure. 
              Smart, sustainable, and seamlessly integrated.
            </VuiTypography>
            <VuiBox display="flex" justifyContent="center" gap={2} flexWrap="wrap">
              <VuiButton 
                variant="contained" 
                color="info" 
                size="large"
                sx={{ minWidth: "200px" }}
              >
                Get Started
              </VuiButton>
              <VuiButton 
                variant="outlined" 
                color="white" 
                size="large"
                sx={{ minWidth: "200px" }}
              >
                Learn More
              </VuiButton>
            </VuiBox>
          </VuiBox>
        </Container>
      </VuiBox>

      {/* Statistics Section */}
      <VuiBox py={6}>
        <Container maxWidth="lg">
          <VuiBox mb={6}>
            <VuiTypography variant="h2" color="white" fontWeight="bold" textAlign="center" mb={2}>
              Our Impact
            </VuiTypography>
            <VuiTypography variant="body1" color="text" textAlign="center" mb={4}>
              Leading the charge in sustainable transportation infrastructure
            </VuiTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} xl={3}>
                <MiniStatisticsCard
                  title={{ text: "charging stations", fontWeight: "regular" }}
                  count="5,000+"
                  percentage={{ color: "success", text: "+25%" }}
                  icon={{ color: "info", component: <IoFlash size="22px" color="white" /> }}
                />
              </Grid>
              <Grid item xs={12} md={6} xl={3}>
                <MiniStatisticsCard
                  title={{ text: "vehicles charged" }}
                  count="250K+"
                  percentage={{ color: "success", text: "+18%" }}
                  icon={{ color: "info", component: <IoGlobe size="22px" color="white" /> }}
                />
              </Grid>
              <Grid item xs={12} md={6} xl={3}>
                <MiniStatisticsCard
                  title={{ text: "CO2 saved (tons)" }}
                  count="12,500"
                  percentage={{ color: "success", text: "+30%" }}
                  icon={{ color: "info", component: <IoLeaf size="22px" color="white" /> }}
                />
              </Grid>
              <Grid item xs={12} md={6} xl={3}>
                <MiniStatisticsCard
                  title={{ text: "energy delivered" }}
                  count="50 GWh"
                  percentage={{ color: "success", text: "+22%" }}
                  icon={{ color: "info", component: <IoWallet size="20px" color="white" /> }}
                />
              </Grid>
            </Grid>
          </VuiBox>
        </Container>
      </VuiBox>

      {/* Features Section */}
      <VuiBox py={6}>
        <Container maxWidth="lg">
          <VuiBox textAlign="center" mb={6}>
            <VuiTypography variant="h2" color="white" fontWeight="bold" mb={2}>
              Why Choose Our EVCS?
            </VuiTypography>
            <VuiTypography variant="body1" color="text" mb={4}>
              Advanced technology meets user-friendly design
            </VuiTypography>
          </VuiBox>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <VuiBox p={3} textAlign="center">
                  <VuiBox
                    bgColor="info"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ 
                      borderRadius: "50%", 
                      width: "60px", 
                      height: "60px",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <IoIosRocket color="#fff" size="30px" />
                  </VuiBox>
                  <VuiTypography variant="h5" color="white" fontWeight="bold" mb={2}>
                    Fast Charging
                  </VuiTypography>
                  <VuiTypography variant="body2" color="text">
                    Ultra-fast charging capabilities with power outputs up to 350kW. 
                    Get back on the road in minutes, not hours.
                  </VuiTypography>
                </VuiBox>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <VuiBox p={3} textAlign="center">
                  <VuiBox
                    bgColor="info"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ 
                      borderRadius: "50%", 
                      width: "60px", 
                      height: "60px",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <IoBuild color="#fff" size="30px" />
                  </VuiBox>
                  <VuiTypography variant="h5" color="white" fontWeight="bold" mb={2}>
                    Smart Technology
                  </VuiTypography>
                  <VuiTypography variant="body2" color="text">
                    AI-powered load management, predictive maintenance, 
                    and seamless integration with smart grid systems.
                  </VuiTypography>
                </VuiBox>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <VuiBox p={3} textAlign="center">
                  <VuiBox
                    bgColor="info"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ 
                      borderRadius: "50%", 
                      width: "60px", 
                      height: "60px",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <IoShield color="#fff" size="30px" />
                  </VuiBox>
                  <VuiTypography variant="h5" color="white" fontWeight="bold" mb={2}>
                    Secure & Reliable
                  </VuiTypography>
                  <VuiTypography variant="body2" color="text">
                    Enterprise-grade security with 99.9% uptime. 
                    Your charging experience is always safe and dependable.
                  </VuiTypography>
                </VuiBox>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </VuiBox>

      {/* CTA Section */}
      <VuiBox py={8}>
        <Container maxWidth="lg">
          <Card>
            <VuiBox 
              p={6} 
              textAlign="center"
              sx={{
                background: linearGradient(
                  cardContent.main,
                  cardContent.state,
                  cardContent.deg
                ),
              }}
            >
              <VuiTypography variant="h2" color="white" fontWeight="bold" mb={3}>
                Ready to Power Your Fleet?
              </VuiTypography>
              <VuiTypography variant="body1" color="text" mb={4} sx={{ maxWidth: "600px", mx: "auto" }}>
                Join thousands of businesses and individuals who trust our EV charging solutions. 
                Start your sustainable journey today.
              </VuiTypography>
              <VuiBox display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                <VuiButton 
                  variant="contained" 
                  color="info" 
                  size="large"
                  sx={{ minWidth: "200px" }}
                >
                  Contact Sales
                </VuiButton>
                <VuiButton 
                  variant="outlined" 
                  color="white" 
                  size="large"
                  sx={{ minWidth: "200px" }}
                >
                  View Pricing
                </VuiButton>
              </VuiBox>
            </VuiBox>
          </Card>
        </Container>
      </VuiBox>

      <Footer />
    </VuiBox>
  );
}

export default Landing;