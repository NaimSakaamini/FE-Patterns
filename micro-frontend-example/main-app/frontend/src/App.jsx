import React, { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import TodoList from './components/TodoList';

// Dynamically import the CategoryManager component from the feature app
const CategoryManager = React.lazy(() => import('featureApp/CategoryManager'));

function App() {
  const [showFeatureApp, setShowFeatureApp] = useState(false);
  const todos = useSelector(state => state.todos.items);
  const categories = useSelector(state => state.categories.items);

  // Function to show the shared store status
  const showSharedStoreStatus = () => {
    alert(`Shared Redux Store Status:
- Todos: ${todos.length} items
- Categories: ${categories.length} items`);
  };

  return (
    <div className="app-container">
      <h1>Micro Frontend Example</h1>
      
      <div className="store-status">
        <h3>Shared Redux Store Status:</h3>
        <p>Todos: {todos.length} items</p>
        <p>Categories: {categories.length} items</p>
        <button onClick={showSharedStoreStatus}>Show Store Status</button>
      </div>
      
      <TodoList />
      
      <div>
        <button onClick={() => setShowFeatureApp(!showFeatureApp)}>
          {showFeatureApp ? 'Hide' : 'Show'} Category Manager
        </button>
      </div>
      
      {showFeatureApp && (
        <div className="feature-app-container">
          <Suspense fallback={<div>Loading Category Manager...</div>}>
            <CategoryManager />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default App; 