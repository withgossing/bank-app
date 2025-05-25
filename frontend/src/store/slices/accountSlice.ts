import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Account {
  id: number;
  accountNumber: string;
  userId: number;
  productId: number;
  productName?: string;
  balance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  'account/fetchAccounts',
  async () => {
    const response = await axios.get('/api/accounts', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  }
);

export const createAccount = createAsyncThunk(
  'account/createAccount',
  async (productId: number) => {
    const response = await axios.post(
      '/api/accounts',
      { productId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  }
);

export const fetchTransactions = createAsyncThunk(
  'account/fetchTransactions',
  async (accountNumber: string) => {
    const response = await axios.get(
      `/api/accounts/${accountNumber}/transactions`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  }
);

export const deposit = createAsyncThunk(
  'account/deposit',
  async ({ accountNumber, amount }: { accountNumber: string; amount: number }) => {
    const response = await axios.post(
      `/api/accounts/${accountNumber}/deposit`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  }
);

export const withdraw = createAsyncThunk(
  'account/withdraw',
  async ({ accountNumber, amount }: { accountNumber: string; amount: number }) => {
    const response = await axios.post(
      `/api/accounts/${accountNumber}/withdraw`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  }
);

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    selectAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '계좌 목록을 불러오는데 실패했습니다.';
      })
      // Create Account
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      })
      // Fetch Transactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      // Deposit
      .addCase(deposit.fulfilled, (state, action) => {
        const account = state.accounts.find(
          (acc) => acc.accountNumber === action.payload.accountNumber
        );
        if (account) {
          account.balance = action.payload.balance;
        }
        if (state.selectedAccount?.accountNumber === action.payload.accountNumber) {
          state.selectedAccount.balance = action.payload.balance;
        }
      })
      // Withdraw
      .addCase(withdraw.fulfilled, (state, action) => {
        const account = state.accounts.find(
          (acc) => acc.accountNumber === action.payload.accountNumber
        );
        if (account) {
          account.balance = action.payload.balance;
        }
        if (state.selectedAccount?.accountNumber === action.payload.accountNumber) {
          state.selectedAccount.balance = action.payload.balance;
        }
      });
  },
});

export const { selectAccount, clearError } = accountSlice.actions;
export default accountSlice.reducer;
