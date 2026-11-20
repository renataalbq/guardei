import { createBrowserRouter, RouterProvider } from 'react-router';
import { ChallengePage } from './routes/ChallengePage';
import { CreateChallengePage } from './routes/CreateChallengePage';
import { HomePage } from './routes/HomePage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/novo', element: <CreateChallengePage /> },
  { path: '/desafio/:challengeId', element: <ChallengePage /> },
  { path: '*', element: <HomePage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
