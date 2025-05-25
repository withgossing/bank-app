import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Savings,
  AccountBalance,
  Timer,
  TrendingUp,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { fetchProducts, selectProduct } from '../store/slices/productSlice';
import { createAccount } from '../store/slices/accountSlice';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { products, selectedProduct } = useSelector(
    (state: RootState) => state.product
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const getProductIcon = (productType: string) => {
    switch (productType) {
      case 'SAVINGS':
        return <Savings />;
      case 'FIXED_DEPOSIT':
        return <Timer />;
      case 'REGULAR_DEPOSIT':
        return <AccountBalance />;
      default:
        return <TrendingUp />;
    }
  };

  const getProductTypeLabel = (productType: string) => {
    switch (productType) {
      case 'SAVINGS':
        return '자유적금';
      case 'FIXED_DEPOSIT':
        return '정기예금';
      case 'REGULAR_DEPOSIT':
        return '정기적금';
      default:
        return '예금상품';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const handleOpenAccount = (product: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(selectProduct(product));
    setOpenDialog(true);
  };

  const handleConfirmOpenAccount = async () => {
    if (selectedProduct) {
      try {
        await dispatch(createAccount(selectedProduct.id)).unwrap();
        setOpenDialog(false);
        navigate('/accounts');
      } catch (error) {
        console.error('계좌 개설 실패:', error);
      }
    }
  };

  const calculateInterest = (principal: number, rate: number, months: number) => {
    const yearlyInterest = principal * (rate / 100);
    const totalInterest = (yearlyInterest * months) / 12;
    const tax = totalInterest * 0.154; // 15.4% 세금
    const afterTaxInterest = totalInterest - tax;
    
    return {
      totalInterest,
      tax,
      afterTaxInterest,
      totalAmount: principal + afterTaxInterest,
    };
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        예금 상품
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        고객님의 목적에 맞는 최적의 예금 상품을 선택하세요.
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} md={6} lg={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: 'primary.main', mr: 2 }}>
                    {getProductIcon(product.productType)}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {product.productName}
                    </Typography>
                    <Chip
                      label={getProductTypeLabel(product.productType)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    연 {product.interestRate}%
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  최소 가입금액: {formatCurrency(product.minAmount)}
                </Typography>
                {product.maxAmount && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    최대 가입금액: {formatCurrency(product.maxAmount)}
                  </Typography>
                )}
                {product.durationMonths && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    가입 기간: {product.durationMonths}개월
                  </Typography>
                )}

                {/* 예상 수익 계산 */}
                {product.durationMonths && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      예상 수익 (1,000만원 기준)
                    </Typography>
                    {(() => {
                      const result = calculateInterest(
                        10000000,
                        product.interestRate,
                        product.durationMonths
                      );
                      return (
                        <>
                          <Typography variant="caption" display="block">
                            세전 이자: {formatCurrency(result.totalInterest)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            세금: {formatCurrency(result.tax)}
                          </Typography>
                          <Typography variant="caption" display="block" color="primary">
                            세후 이자: {formatCurrency(result.afterTaxInterest)}
                          </Typography>
                        </>
                      );
                    })()}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleOpenAccount(product)}
                  disabled={!product.isActive}
                >
                  {product.isActive ? '계좌 개설' : '판매 중지'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 계좌 개설 확인 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          계좌 개설 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {selectedProduct && (
              <>
                <strong>{selectedProduct.productName}</strong> 상품으로 새로운 계좌를 개설하시겠습니까?
                <br />
                <br />
                상품 정보:
                <br />
                - 이자율: 연 {selectedProduct.interestRate}%
                <br />
                - 최소 가입금액: {formatCurrency(selectedProduct.minAmount)}
                {selectedProduct.durationMonths && (
                  <>
                    <br />
                    - 가입 기간: {selectedProduct.durationMonths}개월
                  </>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleConfirmOpenAccount} autoFocus variant="contained">
            개설하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
