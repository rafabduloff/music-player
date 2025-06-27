import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MainLayout } from './components/Layout/MainLayout';

function App() {
  return (
    <Router>
      <DndProvider backend={HTML5Backend}>
        <div className="App">
          <MainLayout />
        </div>
      </DndProvider>
    </Router>
  );
}

export default App;