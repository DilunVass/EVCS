// @mui material components
import Grid from "@mui/material/Grid";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";

// Vision UI Dashboard React components
import MasterCard from "examples/Cards/MasterCard";
// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Stations page components
import EVChargingSimulation from "./components/Station";

function Stations() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox mt={4}>
        <EVChargingSimulation />
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Stations;
