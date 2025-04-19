import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Paper,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e'];

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#22c55e',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#6366f1',
            },
          },
        },
      },
    },
  },
});

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [prepaymentAmount, setPrepaymentAmount] = useState(0);
  const [prepaymentFrequency, setPrepaymentFrequency] = useState('monthly');
  const [yearlyStepUp, setYearlyStepUp] = useState(0);
  const [calculationResults, setCalculationResults] = useState({
    monthlyEMI: 0,
    totalInterest: 0,
    payoffTime: 0,
    amortizationSchedule: [],
    pieChartData: [],
  });

  const calculateLoan = () => {
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTenure * 12;
    let remainingLoan = loanAmount;
    let baseMonthlyEMI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    let totalInterestPaid = 0;
    let currentEMI = baseMonthlyEMI;
    const amortizationSchedule = [];
    let month = 1;
    let year = 0;

    while (remainingLoan > 0 && month <= totalMonths * 2) { // Safety limit
      // Apply yearly step-up at the beginning of each year (except first year)
      if (month % 12 === 1 && month > 1 && yearlyStepUp > 0) {
        currentEMI = currentEMI * (1 + yearlyStepUp / 100);
      }

      // Calculate interest and principal for this month
      const monthlyInterest = remainingLoan * monthlyRate;
      const monthlyPrincipal = currentEMI - monthlyInterest;

      // Add prepayment if applicable
      let prepayment = 0;
      if (prepaymentAmount > 0) {
        if (prepaymentFrequency === 'monthly') {
          prepayment = prepaymentAmount;
        } else if (prepaymentFrequency === 'quarterly' && month % 3 === 0) {
          prepayment = prepaymentAmount;
        } else if (prepaymentFrequency === 'yearly' && month % 12 === 0) {
          prepayment = prepaymentAmount;
        }
      }

      remainingLoan = remainingLoan - monthlyPrincipal - prepayment;
      totalInterestPaid += monthlyInterest;

      if (month % 12 === 0) {
        amortizationSchedule.push({
          year: month / 12,
          remainingLoan: Math.max(0, remainingLoan),
          currentEMI: currentEMI
        });
        year++;
      }

      month++;
    }

    const payoffTime = (month - 1) / 12;

    const pieChartData = [
      { name: 'Principal', value: loanAmount },
      { name: 'Interest', value: totalInterestPaid },
    ];

    setCalculationResults({
      monthlyEMI: currentEMI,
      totalInterest: totalInterestPaid,
      payoffTime,
      amortizationSchedule,
      pieChartData,
    });
  };

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTenure, prepaymentAmount, prepaymentFrequency, yearlyStepUp]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        p: 3,
        background: 'linear-gradient(135deg, #f6f7ff 0%, #e8eaff 100%)',
      }}>
        <Box sx={{
          maxWidth: 1200,
          margin: '0 auto',
          animation: 'fadeIn 0.5s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: 5,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #6366f1, #22c55e)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Home Loan Calculator
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#4f46e5', fontWeight: 600 }}>
                  Loan Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Loan Amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      InputProps={{
                        startAdornment: '₹',
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Interest Rate (%)"
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      inputProps={{ step: "0.1" }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Loan Tenure (Years)"
                      type="number"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#4f46e5', fontWeight: 600 }}>
                  Prepayment & Step-up Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Prepayment Amount"
                      type="number"
                      value={prepaymentAmount}
                      onChange={(e) => setPrepaymentAmount(Number(e.target.value))}
                      InputProps={{
                        startAdornment: '₹',
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Prepayment Frequency</InputLabel>
                      <Select
                        value={prepaymentFrequency}
                        label="Prepayment Frequency"
                        onChange={(e) => setPrepaymentFrequency(e.target.value)}
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="quarterly">Quarterly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Yearly Step-up (%)"
                      type="number"
                      value={yearlyStepUp}
                      onChange={(e) => setYearlyStepUp(Number(e.target.value))}
                      inputProps={{ step: "0.1" }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ 
                p: 4,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                  Results
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                        Initial Monthly EMI
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#4f46e5', fontWeight: 600 }}>
                        {formatCurrency(calculationResults.monthlyEMI / Math.pow(1 + yearlyStepUp / 100, Math.floor(calculationResults.payoffTime)))}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                        Final Monthly EMI
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#4f46e5', fontWeight: 600 }}>
                        {formatCurrency(calculationResults.monthlyEMI)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                        Total Interest
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#4f46e5', fontWeight: 600 }}>
                        {formatCurrency(calculationResults.totalInterest)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                        Loan Payoff Time
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#4f46e5', fontWeight: 600 }}>
                        {calculationResults.payoffTime.toFixed(1)} years
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom align="center" sx={{ color: '#4f46e5', fontWeight: 600, mb: 3 }}>
                  Loan Amortization
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <LineChart
                    width={410}
                    height={400}
                    data={calculationResults.amortizationSchedule}
                    margin={{ top: 20, right: 30, left: 65, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="year" 
                      label={{ 
                        value: 'Years', 
                        position: 'bottom', 
                        offset: 25,
                        fill: '#6b7280'
                      }}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Remaining Loan (₹)', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -50,
                        fill: '#6b7280'
                      }}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{
                        paddingTop: "20px",
                        marginBottom: "-10px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="remainingLoan" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      name="Remaining Loan"
                      dot={{ fill: '#6366f1', strokeWidth: 2 }}
                    />
                  </LineChart>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom align="center" sx={{ color: '#4f46e5', fontWeight: 600, mb: 3 }}>
                  Payment Distribution
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <PieChart width={500} height={300}>
                    <Pie
                      data={calculationResults.pieChartData}
                      cx={250}
                      cy={150}
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {calculationResults.pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LoanCalculator; 