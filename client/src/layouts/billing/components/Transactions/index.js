

// @mui material components
import Card from "@mui/material/Card";
// import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

// Billing page components
import Transaction from "layouts/billing/components/Transaction";
import React, { useState, useEffect } from 'react';
import { Chip, CircularProgress } from '@mui/material';
import VuiButton from 'components/VuiButton';
import { IoFlash, IoTime, IoCard, IoCheckmark, IoClose, IoTime as IoPending } from 'react-icons/io5';
import { FaChargingStation } from 'react-icons/fa';
import api from 'layouts/stations/api';

function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/payments');
        setPayments(response.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <IoCheckmark size="14px" />;
      case 'pending':
        return <IoPending size="14px" />;
      case 'failed':
        return <IoClose size="14px" />;
      default:
        return <IoCard size="14px" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card>
        <VuiBox p={3} display="flex" alignItems="center" justifyContent="center" minHeight="400px">
          <CircularProgress />
        </VuiBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <VuiBox p={3}>
          <VuiTypography variant="lg" color="error" fontWeight="bold" mb="5px">
            Error Loading Transactions
          </VuiTypography>
          <VuiTypography variant="button" color="text">
            {error}
          </VuiTypography>
        </VuiBox>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <VuiBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="18px"
        sx={({ breakpoints }) => ({
          [breakpoints.down("lg")]: {
            flexDirection: "column",
          },
        })}
      >
        <VuiTypography
          variant="lg"
          fontWeight="bold"
          textTransform="capitalize"
          color="white"
          sx={({ breakpoints }) => ({
            [breakpoints.only("sm")]: {
              mb: "6px",
            },
          })}
        >
          Your Transaction&apos;s
        </VuiTypography>
        <VuiBox display="flex" alignItems="flex-start">
          <VuiBox color="white" mr="6px" lineHeight={0}>
            <Icon color="inherit" fontSize="small">
              date_range
            </Icon>
          </VuiBox>
          <VuiTypography variant="button" color="text" fontWeight="regular">
            23 - 30 March 2020
          </VuiTypography>
        </VuiBox>
      </VuiBox>
      <VuiBox>
        
      </VuiBox>
      <VuiBox p={3}>
        <VuiBox display="flex" alignItems="center" mb="20px">
          <FaChargingStation size="20px" color="white" />
          <VuiTypography variant="lg" color="white" fontWeight="bold" ml={1}>
            Charging Transaction History
          </VuiTypography>
        </VuiBox>
        
        <VuiBox>
          {payments.length === 0 ? (
            <VuiBox textAlign="center" py={4}>
              <VuiTypography variant="button" color="text">
                No charging transactions found
              </VuiTypography>
            </VuiBox>
          ) : (
            payments.map((payment) => (
              <VuiBox key={payment.id} mb={2} p={2} 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <VuiBox display="flex" alignItems="center">
                    <IoFlash size="16px" color="#f59e0b" />
                    <VuiTypography variant="button" color="white" fontWeight="bold" ml={1}>
                      Charging Session
                    </VuiTypography>
                  </VuiBox>
                  
                  <Chip 
                    icon={getStatusIcon(payment.status)}
                    label={payment.status.toUpperCase()}
                    size="small"
                    sx={{ 
                      backgroundColor: getStatusColor(payment.status) === 'success' ? '#16a34a' : 
                                       getStatusColor(payment.status) === 'warning' ? '#f59e0b' : 
                                       getStatusColor(payment.status) === 'error' ? '#ef4444' : '#3b82f6',
                      color: 'white',
                      fontWeight: 'bold',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </VuiBox>
                
                <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <VuiTypography variant="h6" color="white" fontWeight="bold">
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </VuiTypography>
                  
                  <VuiTypography variant="caption" color="text">
                    {formatDate(payment.created_at)}
                  </VuiTypography>
                </VuiBox>
                
                <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <VuiBox display="flex" alignItems="center">
                    <IoCard size="14px" color="#6b7280" />
                    <VuiTypography variant="caption" color="text" ml={0.5}>
                      {payment.payment_method.provider} •••• {payment.payment_method.last_four_digits}
                    </VuiTypography>
                  </VuiBox>
                  
                  <VuiTypography variant="caption" color="text">
                    TXN: {payment.transaction_id}
                  </VuiTypography>
                </VuiBox>
                
                {payment.failure_reason && (
                  <VuiBox mt={1} p={1} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                    <VuiTypography variant="caption" color="error">
                      Failed: {payment.failure_reason}
                    </VuiTypography>
                  </VuiBox>
                )}
                
                {payment.processed_at && (
                  <VuiBox display="flex" alignItems="center" mt={1}>
                    <IoTime size="12px" color="#6b7280" />
                    <VuiTypography variant="caption" color="text" ml={0.5}>
                      Processed: {formatDate(payment.processed_at)}
                    </VuiTypography>
                  </VuiBox>
                )}
              </VuiBox>
            ))
          )}
        </VuiBox>
        
        {payments.length > 0 && (
          <VuiBox mt={3} textAlign="center">
            <VuiButton variant="outlined" color="info" size="small">
              View All Transactions
            </VuiButton>
          </VuiBox>
        )}
      </VuiBox>
    </Card>
  );
}

export default Transactions;
