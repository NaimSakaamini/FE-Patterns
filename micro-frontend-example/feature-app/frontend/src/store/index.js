// Re-export the actions from the main app's store
// This allows the feature app to use the same Redux store as the main app

// Define the actions locally for standalone mode
// In federated mode, these will be overridden by the main app's store
import { createSlice, configureStore } from '@reduxjs/toolkit';

// Category slice for standalone mode
const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    setCategories: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addCategory: (state, action) => {
      state.items.push(action.payload);
    },
    updateCategory: (state, action) => {
      const index = state.items.findIndex(category => category.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCategory: (state, action) => {
      state.items = state.items.filter(category => category.id !== action.payload);
    },
    setCategoryLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setCategoryError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

// Todo slice for standalone mode
const todoSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {}
});

// Create a standalone store for when the feature app is running by itself
export const standaloneStore = configureStore({
  reducer: {
    categories: categorySlice.reducer,
    todos: todoSlice.reducer
  }
});

// Export actions
export const { 
  setCategories, addCategory, updateCategory, deleteCategory, 
  setCategoryLoading, setCategoryError 
} = categorySlice.actions;

// The actual store instance will be imported from the main app at runtime
// through Module Federation shared dependencies 