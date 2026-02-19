import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { NoteProvider } from './context/NoteContext';
import Home from './Home';
// import 'prismjs/components/prism-typescript';
// import 'prismjs/components/prism-javascript';
// import 'prismjs/components/prism-python';
// import 'prism-themes/themes/prism-vsc-dark-plus.css';
// import Prism from 'prismjs';

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
