import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { NoteProvider } from './context/NoteContext';
import Home from './Home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
]);

function App() {
  return (
    <NoteProvider>
      <RouterProvider router={router} />
    </NoteProvider>
  );
}

export default App;
