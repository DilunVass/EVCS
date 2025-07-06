// @mui material components
import Grid from "@mui/material/Grid";
import { Card } from "@mui/material";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// EV Dashboard components
import EVStatistics from "layouts/dashboard/components/EVStatistics";
import EVAnalytics from "layouts/dashboard/components/EVAnalytics";
import WelcomeMark from "layouts/dashboard/components/WelcomeMark";

// Data visualization
import LineChart from "examples/Charts/LineCharts/LineChart";
import { lineChartDataDashboard } from "layouts/dashboard/data/lineChartData";
import { lineChartOptionsDashboard } from "layouts/dashboard/data/lineChartOptions";

function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <VuiBox mb={3}>
          <EVStatistics />
        </VuiBox>
        
        {/* <VuiBox mb={3}>
          <Grid container spacing="18px">
            <Grid item xs={12} lg={12} xl={12}>
              <WelcomeMark />
            </Grid>
          </Grid>
        </VuiBox> */}
        
        <VuiBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6} xl={7}>
              <Card>
                <VuiBox sx={{ height: "100%" }}>
                  <VuiTypography variant="lg" color="white" fontWeight="bold" mb="5px">
                    EV Charging Usage Overview
                  </VuiTypography>
                  <VuiBox display="flex" alignItems="center" mb="40px">
                    <VuiTypography variant="button" color="success" fontWeight="bold">
                      Real-time{" "}
                      <VuiTypography variant="button" color="text" fontWeight="regular">
                        charging station data
                      </VuiTypography>
                    </VuiTypography>
                  </VuiBox>
                  <VuiBox sx={{ height: "310px" }}>
                    <LineChart
                      lineChartData={lineChartDataDashboard}
                      lineChartOptions={lineChartOptionsDashboard}
                    />
                  </VuiBox>
                </VuiBox>
              </Card>
            </Grid>
            <Grid item xs={12} lg={6} xl={5}>
              <EVAnalytics />
            </Grid>
          </Grid>
        </VuiBox>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
