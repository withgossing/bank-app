import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  // User 관련 상태
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
});

export default userSlice.reducer;
