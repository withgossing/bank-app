import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Receipt,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchAccounts } from '../store/slices/accountSlice';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { accounts } = useSelector((state: RootState) => state.account);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        대시보드
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        안녕하세요, {user?.fullName}님!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* 총 잔액 카드 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">총 잔액</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(totalBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 계좌 수 카드 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">보유 계좌</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {accounts.length}개
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 평균 이자율 카드 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">평균 이자율</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                2.5%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 계좌 목록 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">내 계좌 목록</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/products')}
              >
                계좌 개설
              </Button>
            </Box>
            <List>
              {accounts.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="보유한 계좌가 없습니다."
                    secondary="새로운 계좌를 개설해보세요!"
                  />
                </ListItem>
              ) : (
                accounts.map((account, index) => (
                  <React.Fragment key={account.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      button
                      onClick={() => navigate(`/accounts/${account.accountNumber}`)}
                    >
                      <ListItemText
                        primary={account.accountNumber}
                        secondary={account.productName || '일반 계좌'}
                      />
                      <Typography variant="h6" color="primary">
                        {formatCurrency(account.balance)}
                      </Typography>
                    </ListItem>
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
