import React, { useState, useEffect } from 'react';
import { Card, Grid, CircularProgress } from '@mui/material';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiProgress from 'components/VuiProgress';
import { IoCash, IoCard, IoCheckmark, IoTime, IoFlash } from 'react-icons/io5';
import { FaChargingStation } from 'react-icons/fa';
import api from 'layouts/stations/api';

const PaymentSummary = () => {
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
        setError('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <VuiBox p={3} display="flex" alignItems="center" justifyContent="center" minHeight="300px">
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
            Error Loading Payment Summary
          </VuiTypography>
          <VuiTypography variant="button" color="text">
            {error}
          </VuiTypography>
        </VuiBox>
      </Card>
    );
  }

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'completed' || p.status === 'paid').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;
  const totalTransactions = payments.length;

  return (
    <Card>
      <VuiBox p={3}>
        <VuiBox display="flex" alignItems="center" mb="20px">
          <FaChargingStation size="20px" color="white" />
          <VuiTypography variant="lg" color="white" fontWeight="bold" ml={1}>
            EV Charging Payment Overview
          </VuiTypography>
        </VuiBox>
        
        {totalTransactions === 0 ? (
          <VuiBox textAlign="center" py={4}>
            <IoFlash size="48px" color="#6b7280" />
            <VuiTypography variant="h6" color="text" mt={2}>
              No charging payments yet
            </VuiTypography>
            <VuiTypography variant="button" color="text">
              Start charging to see your payment history
            </VuiTypography>
          </VuiBox>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <VuiBox mb={3}>
                <VuiBox display="flex" alignItems="center" mb="8px">
                  <VuiBox
                    bgColor="success"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                  >
                    <IoCash color="#fff" size="12px" />
                  </VuiBox>
                  <VuiTypography color="text" variant="button" fontWeight="medium">
                    Total Spent on Charging
                  </VuiTypography>
                </VuiBox>
                <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                  ${totalAmount.toFixed(2)}
                </VuiTypography>
                <VuiProgress 
                  value={Math.min(totalAmount * 2, 100)} 
                  color="success" 
                  sx={{ background: "#2D2E5F" }} 
                />
                <VuiTypography color="text" variant="caption" mt={1}>
                  From {totalTransactions} charging session{totalTransactions !== 1 ? 's' : ''}
                </VuiTypography>
              </VuiBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <VuiBox mb={3}>
                <VuiBox display="flex" alignItems="center" mb="8px">
                  <VuiBox
                    bgColor="info"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                  >
                    <IoCheckmark color="#fff" size="12px" />
                  </VuiBox>
                  <VuiTypography color="text" variant="button" fontWeight="medium">
                    Successful Payments
                  </VuiTypography>
                </VuiBox>
                <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                  {completedPayments}
                </VuiTypography>
                <VuiProgress 
                  value={totalTransactions > 0 ? (completedPayments / totalTransactions) * 100 : 0} 
                  color="info" 
                  sx={{ background: "#2D2E5F" }} 
                />
                <VuiTypography color="text" variant="caption" mt={1}>
                  {totalTransactions > 0 ? Math.round((completedPayments / totalTransactions) * 100) : 0}% success rate
                </VuiTypography>
              </VuiBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <VuiBox mb={3}>
                <VuiBox display="flex" alignItems="center" mb="8px">
                  <VuiBox
                    bgColor="warning"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                  >
                    <IoTime color="#fff" size="12px" />
                  </VuiBox>
                  <VuiTypography color="text" variant="button" fontWeight="medium">
                    Pending Payments
                  </VuiTypography>
                </VuiBox>
                <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                  {pendingPayments}
                </VuiTypography>
                <VuiProgress 
                  value={totalTransactions > 0 ? (pendingPayments / totalTransactions) * 100 : 0} 
                  color="warning" 
                  sx={{ background: "#2D2E5F" }} 
                />
                <VuiTypography color="text" variant="caption" mt={1}>
                  {pendingPayments > 0 ? 'Processing...' : 'All payments processed'}
                </VuiTypography>
              </VuiBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <VuiBox mb={3}>
                <VuiBox display="flex" alignItems="center" mb="8px">
                  <VuiBox
                    bgColor="error"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ borderRadius: "6px", width: "25px", height: "25px", mr: 1 }}
                  >
                    <IoCard color="#fff" size="12px" />
                  </VuiBox>
                  <VuiTypography color="text" variant="button" fontWeight="medium">
                    Failed Payments
                  </VuiTypography>
                </VuiBox>
                <VuiTypography color="white" variant="lg" fontWeight="bold" mb="8px">
                  {failedPayments}
                </VuiTypography>
                <VuiProgress 
                  value={totalTransactions > 0 ? (failedPayments / totalTransactions) * 100 : 0} 
                  color="error" 
                  sx={{ background: "#2D2E5F" }} 
                />
                <VuiTypography color="text" variant="caption" mt={1}>
                  {failedPayments > 0 ? 'Requires attention' : 'No failed payments'}
                </VuiTypography>
              </VuiBox>
            </Grid>
          </Grid>
        )}

        {/* Quick Stats */}
        {totalTransactions > 0 && (
          <VuiBox mt={3} p={2} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <VuiBox textAlign="center">
                  <VuiTypography variant="h6" color="white" fontWeight="bold">
                    ${(totalAmount / totalTransactions).toFixed(2)}
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text">
                    Average per session
                  </VuiTypography>
                </VuiBox>
              </Grid>
              <Grid item xs={12} md={4}>
                <VuiBox textAlign="center">
                  <VuiTypography variant="h6" color="white" fontWeight="bold">
                    {totalTransactions}
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text">
                    Total transactions
                  </VuiTypography>
                </VuiBox>
              </Grid>
              <Grid item xs={12} md={4}>
                <VuiBox textAlign="center">
                  <VuiTypography variant="h6" color="white" fontWeight="bold">
                    {Math.round((completedPayments / totalTransactions) * 100)}%
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text">
                    Success rate
                  </VuiTypography>
                </VuiBox>
              </Grid>
            </Grid>
          </VuiBox>
        )}
      </VuiBox>
    </Card>
  );
};

export default PaymentSummary;