import { importShared } from './__federation_fn_import-ymdNqYlr.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;
	{
	  jsxRuntime.exports = requireReactJsxRuntime_production();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = requireJsxRuntime();

// Re-export the actions from the main app's store
// This allows the feature app to use the same Redux store as the main app

// Define the actions locally for standalone mode
// In federated mode, these will be overridden by the main app's store
const {createSlice,configureStore} = await importShared('@reduxjs/toolkit');


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
const standaloneStore = configureStore({
  reducer: {
    categories: categorySlice.reducer,
    todos: todoSlice.reducer
  }
});

// Export actions
const { 
  setCategories, addCategory, updateCategory, deleteCategory, 
  setCategoryLoading, setCategoryError 
} = categorySlice.actions;

// The actual store instance will be imported from the main app at runtime
// through Module Federation shared dependencies

const React = await importShared('react');
const {useState,useEffect} = React;

const {useSelector,useDispatch} = await importShared('react-redux');
const CategoryManager = () => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const { items: categories, loading, error } = useSelector((state) => state.categories);
  const todosState = useSelector((state) => state.todos || { items: [] });
  const todos = todosState.items || [];
  const dispatch = useDispatch();
  useEffect(() => {
    alert(`Feature App: CategoryManager loaded
Shared Redux Store - Todos count: ${todos.length}`);
    const fetchCategories = async () => {
      dispatch(setCategoryLoading());
      try {
        const response = await fetch("http://localhost:3002/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        dispatch(setCategories(data));
      } catch (err) {
        dispatch(setCategoryError(err.message));
      }
    };
    fetchCategories();
  }, [dispatch, todos.length]);
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const response = await fetch("http://localhost:3002/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (!response.ok) {
        throw new Error("Failed to add category");
      }
      const newCategory = await response.json();
      dispatch(addCategory(newCategory));
      setNewCategoryName("");
    } catch (err) {
      dispatch(setCategoryError(err.message));
    }
  };
  const handleUpdateCategory = async (category, newName) => {
    try {
      const response = await fetch(`http://localhost:3002/api/categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...category, name: newName })
      });
      if (!response.ok) {
        throw new Error("Failed to update category");
      }
      const updatedCategory = await response.json();
      dispatch(updateCategory(updatedCategory));
    } catch (err) {
      dispatch(setCategoryError(err.message));
    }
  };
  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/api/categories/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete category");
      }
      dispatch(deleteCategory(id));
    } catch (err) {
      dispatch(setCategoryError(err.message));
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading categories..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      "Error: ",
      error
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "category-manager", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Category Manager" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddCategory, className: "add-category-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: newCategoryName,
          onChange: (e) => setNewCategoryName(e.target.value),
          placeholder: "Add a new category"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", children: "Add" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "categories", children: categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "category-item", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: category.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "category-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          const newName = prompt("Enter new category name:", category.name);
          if (newName && newName !== category.name) {
            handleUpdateCategory(category, newName);
          }
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteCategory(category.id), children: "Delete" })
      ] })
    ] }, category.id)) })
  ] });
};

export { CategoryManager as default, jsxRuntimeExports as j, standaloneStore as s };
