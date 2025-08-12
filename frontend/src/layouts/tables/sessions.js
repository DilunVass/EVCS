import { useState } from "react";
import Card from "@mui/material/Card";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import VuiSelect from "components/VuiSelect";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import LinearProgress from "@mui/material/LinearProgress";

import sessionsTableData from "layouts/tables/data/sessionsTableData";

function SessionsTable() {
  const { columns, rows, loading } = sessionsTableData();
  const [filters, setFilters] = useState({
    station_id: "",
    status: ""
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "active", label: "Active" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <VuiBox mb={3}>
          <Card>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb="22px">
              <VuiTypography variant="lg" color="white">
                Charging Sessions
              </VuiTypography>
            </VuiBox>
            
            {/* Filters */}
            <VuiBox display="flex" gap="16px" mb="22px" flexWrap="wrap">
              <VuiBox minWidth="200px">
                <VuiInput
                  placeholder="Station ID"
                  value={filters.station_id}
                  onChange={(e) => handleFilterChange("station_id", e.target.value)}
                />
              </VuiBox>
              <VuiBox minWidth="150px">
                <VuiSelect
                  placeholder="Status"
                  options={statusOptions}
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                />
              </VuiBox>
              <VuiButton variant="gradient" color="info" size="medium">
                Apply Filters
              </VuiButton>
            </VuiBox>

            {loading ? (
              <VuiBox mb={3}>
                <LinearProgress />
                <VuiTypography variant="button" color="text" textAlign="center" mt={2}>
                  Loading sessions...
                </VuiTypography>
              </VuiBox>
            ) : (
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
                <Table columns={columns} rows={rows} />
              </VuiBox>
            )}
          </Card>
        </VuiBox>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SessionsTable;