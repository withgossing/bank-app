import { createSlice } from '@reduxjs/toolkit';

interface ProductState {
  // Product 관련 상태
}

const initialState: ProductState = {};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
});

export default productSlice.reducer;
