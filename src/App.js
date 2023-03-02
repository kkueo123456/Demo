import './App.css';
import router from './router/router'
import Header from './compoments/Header/Header';
import { useRoutes } from 'react-router-dom'
import { Suspense } from 'react';
function App() {
  const route = useRoutes(router)

  return (
    <div className="App">
      <Header></Header>
      <Suspense  fallback={
            <div
              style={{
                textAlign: 'center',
                marginTop: 200
              }}
            >
              loading...
            </div>
          }>
        {route}
      </Suspense>
      
    </div>
  );
}

export default App;
