import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  // User related state
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
});

export default userSlice.reducer;
