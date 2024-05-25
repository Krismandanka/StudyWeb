import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Navbar from "./Components/common/Navbar";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import OpenRoute from "./Components/core/auth/OpenRoute";
import VerifyOtp from "./Pages/VerifyOtp";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import MyProfile from "./Components/core/Dashboard/MyProfile";
import Setting from "./Components/core/Dashboard/Settings";
import Catalog from "./Pages/Catalog";
import CourseDetails from "./Pages/CourseDetails";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { ACCOUNT_TYPE } from "./utils/constants";
import { useDispatch } from "react";
import Cart from "./Components/core/Dashboard/Cart/index";
import PrivateRoute from "./Components/core/auth/PrivateRoute";
// import EnrollledCourses from "./Components/core/Dashboard/EnrolledCourses";
import VideoDetails from "./Components/core/viewCourse/VideoDetails";
import Dashboard from "./Pages/Dashboard";
import ViewCourse from "./Pages/ViewCourse";
import AddCourse from "./Components/core/Dashboard/AddCourse/index";
import MyCourses from "./Components/core/Dashboard/MyCourses";
import EditCourse from "./Components/core/Dashboard/EditCourse";
import Instructor from "./Components/core/Dashboard/InstructorDashboard/Instructor";

import EnrolledCourses from "./Components/core/Dashboard/EnrolledCourses";
function App() {
  // const user = useSelector((state) => state.profile.user);
  // const dispatch = useDispatch();
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};
  console.log(user.accountType);

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />

        <Route path="/verify-email" element={<VerifyOtp />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/update-password/:id" element={<ResetPassword />} />

        <Route path="/catalog/:catalog" element={<Catalog />} />

        <Route path="/courses/:courseId" element={<CourseDetails />} />

        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="dashboard/my-profile" element={<MyProfile />} />

          <Route path="/dashboard/settings" element={<Setting />} />

          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
            <Route path="/dashboard/cart" element={<Cart />} />
            <Route
              path="dashboard/enrolled-courses"
              element={<EnrolledCourses />}
            />
            {/* <Route
                path="dashboard/purchase-history"
                element={<PurchaseHistory />}
              /> */}
          </>
        )}

          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
              <Route path="dashboard/instructor" element={<Instructor />} />
            </>
          )}
        </Route>

        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="/view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route>

        
      </Routes>
    </div>
  );
}

export default App;
