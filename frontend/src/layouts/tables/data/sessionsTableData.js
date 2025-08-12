import { useState, useEffect } from "react";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiBadge from "components/VuiBadge";
import { getSessions } from "layouts/stations/api";

export default function sessionsTableData() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions({ limit: 50 });
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: "success",
      active: "info",
      failed: "error",
      cancelled: "warning"
    };

    return (
      <VuiBadge
        variant="standard"
        badgeContent={status || 'unknown'}
        color={statusColors[status] || "secondary"}
        size="xs"
        container
      />
    );
  };

  const columns = [
    { name: "session_id", align: "left" },
    { name: "start_time", align: "left" },
    { name: "end_time", align: "left" },
    { name: "duration", align: "center" },
    { name: "energy", align: "center" },
    { name: "charge_level", align: "center" },
    { name: "cost", align: "center" },
    { name: "status", align: "center" },
  ];

  const rows = sessions.map((session) => {
    // Handle null/undefined dates
    const startTime = session.start_time ? new Date(session.start_time) : null;
    const endTime = session.end_time ? new Date(session.end_time) : null;
    
    // Calculate duration safely
    let duration = 'N/A';
    if (startTime && endTime) {
      duration = Math.round((endTime - startTime) / 1000 / 60); // duration in minutes
    }

    return {
      session_id: (
        <VuiBox display="flex" alignItems="center">
          <VuiTypography variant="button" color="white" fontWeight="medium">
            {session.id ? session.id.slice(-8) : 'N/A'}
          </VuiTypography>
        </VuiBox>
      ),
      start_time: (
        <VuiTypography variant="button" color="white" fontWeight="medium">
          {formatDate(session.start_time)}
        </VuiTypography>
      ),
      end_time: (
        <VuiTypography variant="button" color="white" fontWeight="medium">
          {formatDate(session.end_time)}
        </VuiTypography>
      ),
      duration: (
        <VuiTypography variant="button" color="white" fontWeight="medium">
          {typeof duration === 'number' ? `${duration} min` : duration}
        </VuiTypography>
      ),
      energy: (
        <VuiTypography variant="button" color="white" fontWeight="medium">
          {session.energy_consumed !== null && session.energy_consumed !== undefined 
            ? `${session.energy_consumed.toFixed(1)} kWh` 
            : 'N/A'}
        </VuiTypography>
      ),
      charge_level: (
        <VuiBox display="flex" flexDirection="column" alignItems="center">
          <VuiTypography variant="caption" color="text" fontWeight="medium">
            {session.initial_charge_level !== null && session.initial_charge_level !== undefined &&
             session.final_charge_level !== null && session.final_charge_level !== undefined
              ? `${session.initial_charge_level}% → ${session.final_charge_level}%`
              : 'N/A'}
          </VuiTypography>
          {session.initial_charge_level !== null && session.initial_charge_level !== undefined &&
           session.final_charge_level !== null && session.final_charge_level !== undefined && (
            <VuiTypography variant="caption" color="success" fontWeight="medium">
              +{session.final_charge_level - session.initial_charge_level}%
            </VuiTypography>
          )}
        </VuiBox>
      ),
      cost: (
        <VuiTypography variant="button" color="white" fontWeight="medium">
          {formatCurrency(session.cost)}
        </VuiTypography>
      ),
      status: getStatusBadge(session.status),
    };
  });

  return {
    columns,
    rows,
    loading
  };
}