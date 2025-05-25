import { createSlice } from '@reduxjs/toolkit';

interface AccountState {
  // Account 관련 상태
}

const initialState: AccountState = {};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
});

export default accountSlice.reducer;
