

import {combineReducers} from "@reduxjs/toolkit"
import authReduces from "../slices/authSlice"
import profileReducer from "../slices/profileSlice";
import cartReducer from "../slices/cartSlice";
import loadingBarSlice from "../slices/loadingBarSlice";
import courseReducer from '../slices/courseSlice'
import viewCourseReducer from "../slices/viewCourseSlice"


const rootReducer = combineReducers({
    auth :authReduces,
    profile:profileReducer,
    cart:cartReducer,
    loadingBar:loadingBarSlice,
    course:courseReducer,
    viewCourse:viewCourseReducer



})

export default rootReducer


