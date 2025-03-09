import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// Todo slice
const todoSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    setTodos: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTodo: (state, action) => {
      state.items.push(action.payload);
    },
    updateTodo: (state, action) => {
      const index = state.items.findIndex(todo => todo.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTodo: (state, action) => {
      state.items = state.items.filter(todo => todo.id !== action.payload);
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

// Category slice (will be used by the feature app)
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

// Export actions
export const { 
  setTodos, addTodo, updateTodo, deleteTodo, setLoading, setError 
} = todoSlice.actions;

export const { 
  setCategories, addCategory, updateCategory, deleteCategory, 
  setCategoryLoading, setCategoryError 
} = categorySlice.actions;

// Create store
const store = configureStore({
  reducer: {
    todos: todoSlice.reducer,
    categories: categorySlice.reducer
  }
});

export default store; 