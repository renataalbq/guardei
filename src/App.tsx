import { createBrowserRouter, RouterProvider } from 'react-router';
import { HomePage } from './routes/HomePage';

const router = createBrowserRouter([{ path: '/', element: <HomePage /> }]);

export function App() {
  return <RouterProvider router={router} />;
}
