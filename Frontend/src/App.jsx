import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PageLayout from './page.layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { Bounce, ToastContainer } from 'react-toastify';
import CreateQuzz from './pages/CreateQuzz';
import QuizzManual from './pages/QuizzManual';
import Security from './pages/Security';
export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <PageLayout />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/create",
          element: <CreateQuzz />,
        },
        {
          path: '/create/manual',
          element: <QuizzManual />
        },
        {
          path: '/create/edit/:id',
          element: <QuizzManual />
        },
        {
          path: '/create/security',
          element: <Security />
        },
        {
          path: '/create/security/add/:id',
          element: <Security />
        },
        {
          path: '/create/security/edit/:id1/:id2',
          element: <Security />
        }
      ]
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <Register />
    }
  ])
  return (
    //quizzes
    <>
      <ToastContainer position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce} />
      {/* toast.success('🦄 Wow so easy!); */}
      <RouterProvider router={router} />
    </>
  )
}



