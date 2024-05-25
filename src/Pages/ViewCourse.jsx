import React from 'react'
import { Outlet } from 'react-router';
import { setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from '../slices/viewCourseSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useState } from 'react';
import ReviewModal from '../Components/core/viewCourse/ReviewModal';
import VideoDetailSidebar from '../Components/core/viewCourse/VideoDetailSidebar';
import { getFullDetailsOfCourse } from '../services/operations/couseDetailsAPI';

const ViewCourse = () => {
    console.log("meee");
    const [reviewModal, setReviewModal] = useState(false)
    const {courseId} = useParams();
    const {token} = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const setCourseSpecifics = async () => {
            const courseData = await getFullDetailsOfCourse(courseId, token);
            dispatch(setCourseSectionData(courseData.courseDetails.courseContent));
            dispatch(setEntireCourseData( courseData.courseDetails));
            dispatch(setCompletedLectures(courseData.completedVideos));
            var lecture = 0;
            courseData?.courseDetails?.courseContent?.forEach((section) => {
                lecture += section?.subSection?.length;
            });
            dispatch(setTotalNoOfLectures(lecture));
        }
        setCourseSpecifics();
    }, [courseId, token, dispatch]);

  return (
    
    <div className=''>
        
        <VideoDetailSidebar setReviewModal={setReviewModal} />
        
        <div>
            <Outlet/>
        </div>
        {
            reviewModal && <ReviewModal setReviewModal={setReviewModal} />
        }
    </div>
  )
}

export default ViewCourse