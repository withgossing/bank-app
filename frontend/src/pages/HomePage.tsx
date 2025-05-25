import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
} from '@mui/material';
import {
  AccountBalance,
  Savings,
  TrendingUp,
  Security,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: '계좌 관리',
      description: '간편하게 계좌를 개설하고 관리하세요.',
    },
    {
      icon: <Savings sx={{ fontSize: 40 }} />,
      title: '다양한 예금 상품',
      description: '목적에 맞는 최적의 예금 상품을 선택하세요.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: '높은 이자율',
      description: '경쟁력 있는 이자율로 자산을 늘리세요.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: '안전한 보안',
      description: '최신 보안 기술로 고객님의 자산을 보호합니다.',
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" gutterBottom align="center">
            스마트한 금융의 시작
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            간편하고 안전한 은행 서비스를 경험하세요
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={() => navigate('/register')}
            >
              지금 시작하기
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ color: 'white', borderColor: 'white' }}
              onClick={() => navigate('/products')}
            >
              상품 둘러보기
            </Button>
          </Box>
        </Container>
      </Box>

      <Container>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          왜 우리 은행인가요?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            지금 바로 시작하세요
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            회원가입은 단 3분이면 완료됩니다
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
          >
            무료로 시작하기
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
