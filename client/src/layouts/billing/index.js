// @mui material components
import Grid from "@mui/material/Grid";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// EV Billing components
import EVBillingInfo from "layouts/billing/components/EVBillingInfo";
import EVTransactions from "layouts/billing/components/Transactions";
import PaymentSummary from "layouts/billing/components/PaymentSummary";

function Billing() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox mt={4}>
        <VuiBox mb={3}>
          <VuiTypography variant="h3" color="white" fontWeight="bold">
            EV Charging Billing
          </VuiTypography>
          <VuiTypography variant="body2" color="text">
            Manage your charging sessions, payments, and billing information
          </VuiTypography>
        </VuiBox>
        
        <VuiBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <PaymentSummary />
            </Grid>
            <Grid item xs={12} lg={4}>
              <EVTransactions />
            </Grid>
          </Grid>
        </VuiBox>
        
        <VuiBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <EVBillingInfo />
            </Grid>
            {/* <Grid item xs={12} lg={5}>
              <EVTransactions />
            </Grid> */}
          </Grid>
        </VuiBox>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
