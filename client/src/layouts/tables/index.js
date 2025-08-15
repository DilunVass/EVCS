// @mui material components
import Card from "@mui/material/Card";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import sessionsTableData from "layouts/tables/data/sessionsTableData";

function Tables() {
  const { columns, rows } = authorsTableData;
  const { columns: prCols, rows: prRows } = projectsTableData;
  const { columns: sessionCols, rows: sessionRows, loading: sessionsLoading } = sessionsTableData();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>

        {/* Charging Sessions table */}
        <VuiBox mb={3}>
          <Card>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb="22px">
              <VuiTypography variant="lg" color="white">
                Charging Sessions
              </VuiTypography>
            </VuiBox>
            <VuiBox
              sx={{
                "& th": {
                  borderBottom: ({ borders: { borderWidth }, palette: { grey } }) =>
                    `${borderWidth[1]} solid ${grey[700]}`,
                },
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth }, palette: { grey } }) =>
                      `${borderWidth[1]} solid ${grey[700]}`,
                  },
                },
              }}
            >
              {sessionsLoading ? (
                <VuiTypography variant="button" color="text" textAlign="center">
                  Loading sessions...
                </VuiTypography>
              ) : (
                <Table columns={sessionCols} rows={sessionRows} />
              )}
            </VuiBox>
          </Card>
        </VuiBox>

        {/* Existing Projects table */}
        
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
