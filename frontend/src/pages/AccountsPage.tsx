import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Add, AccountBalanceWallet, Send, GetApp } from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  fetchAccounts,
  deposit,
  withdraw,
  fetchTransactions,
  selectAccount,
} from '../store/slices/accountSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, selectedAccount, transactions } = useSelector(
    (state: RootState) => state.account
  );

  const [tabValue, setTabValue] = useState(0);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchTransactions(selectedAccount.accountNumber));
    }
  }, [selectedAccount, dispatch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeposit = async () => {
    if (!selectedAccount) return;
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('올바른 금액을 입력해주세요.');
      return;
    }

    try {
      await dispatch(
        deposit({
          accountNumber: selectedAccount.accountNumber,
          amount: depositAmount,
        })
      ).unwrap();
      setDepositOpen(false);
      setAmount('');
      setError('');
      dispatch(fetchTransactions(selectedAccount.accountNumber));
    } catch (err) {
      setError('입금 처리 중 오류가 발생했습니다.');
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccount) return;
    
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('올바른 금액을 입력해주세요.');
      return;
    }

    if (withdrawAmount > selectedAccount.balance) {
      setError('잔액이 부족합니다.');
      return;
    }

    try {
      await dispatch(
        withdraw({
          accountNumber: selectedAccount.accountNumber,
          amount: withdrawAmount,
        })
      ).unwrap();
      setWithdrawOpen(false);
      setAmount('');
      setError('');
      dispatch(fetchTransactions(selectedAccount.accountNumber));
    } catch (err) {
      setError('출금 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        계좌 관리
      </Typography>

      <Grid container spacing={3}>
        {/* 계좌 목록 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                내 계좌 목록
              </Typography>
              <List>
                {accounts.map((account) => (
                  <ListItem
                    key={account.id}
                    button
                    selected={selectedAccount?.id === account.id}
                    onClick={() => dispatch(selectAccount(account))}
                  >
                    <ListItemText
                      primary={account.accountNumber}
                      secondary={formatCurrency(account.balance)}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 계좌 상세 정보 */}
        <Grid item xs={12} md={8}>
          {selectedAccount ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  계좌 정보
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      계좌번호
                    </Typography>
                    <Typography variant="body1">
                      {selectedAccount.accountNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      잔액
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(selectedAccount.balance)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      상품명
                    </Typography>
                    <Typography variant="body1">
                      {selectedAccount.productName || '일반 계좌'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      개설일
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedAccount.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<GetApp />}
                  onClick={() => setDepositOpen(true)}
                >
                  입금
                </Button>
                <Button
                  startIcon={<Send />}
                  onClick={() => setWithdrawOpen(true)}
                >
                  출금
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center">
                  계좌를 선택해주세요.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* 거래 내역 */}
          {selectedAccount && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  거래 내역
                </Typography>
                <List>
                  {transactions.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="거래 내역이 없습니다."
                        secondary="입금이나 출금을 시작해보세요!"
                      />
                    </ListItem>
                  ) : (
                    transactions.map((transaction, index) => (
                      <React.Fragment key={transaction.id}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography
                                  variant="body1"
                                  color={
                                    transaction.transactionType === 'DEPOSIT'
                                      ? 'success.main'
                                      : 'error.main'
                                  }
                                >
                                  {transaction.transactionType === 'DEPOSIT' ? '입금' : '출금'}
                                </Typography>
                                <Typography variant="body1">
                                  {formatCurrency(transaction.amount)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(transaction.createdAt)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  잔액: {formatCurrency(transaction.balanceAfter)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 입금 다이얼로그 */}
      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)}>
        <DialogTitle>입금</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="입금액"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              endAdornment: '원',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositOpen(false)}>취소</Button>
          <Button onClick={handleDeposit} variant="contained">
            입금
          </Button>
        </DialogActions>
      </Dialog>

      {/* 출금 다이얼로그 */}
      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)}>
        <DialogTitle>출금</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="출금액"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              endAdornment: '원',
            }}
          />
          {selectedAccount && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              현재 잔액: {formatCurrency(selectedAccount.balance)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawOpen(false)}>취소</Button>
          <Button onClick={handleWithdraw} variant="contained" color="error">
            출금
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPage;
