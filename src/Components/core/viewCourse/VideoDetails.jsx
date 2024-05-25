import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { markLectureAsComplete } from "../../../services/operations/couseDetailsAPI";
import {updateCompletedLectures} from "../../../slices/viewCourseSlice";
import {ControlBar, Player } from "video-react";
import { BigPlayButton, LoadingSpinner, PlaybackRateMenuButton, ForwardControl, ReplayControl, CurrentTimeDisplay, TimeDivider } from 'video-react';
import {BiSkipPreviousCircle} from 'react-icons/bi';
import {BiSkipNextCircle} from 'react-icons/bi';
import {MdOutlineReplayCircleFilled} from 'react-icons/md';
// import '~video-react/dist/video-react.css';
// import '~video-react/dist/video-react.css';




const VideoDetails = () => {
  const user = localStorage.getItem('user') 
  ? JSON.parse(localStorage.getItem('user'))
  : {}  
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const playerRef = useRef();
  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);
  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const setVideoSpecificDetails = async () => {
      if (!courseSectionData.length) {
        return;
      }
      if (!courseId && !sectionId && !subSectionId) {
        navigate("/dashboard/enrolled-courses");
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        );

        const filteredVideoData = filteredData?.[0].subSection.filter(
          (data) => data._id === subSectionId
        );
        setVideoData(filteredVideoData[0]);
        setVideoEnded(false);
      }
    };
    setVideoSpecificDetails();
  }, [courseEntireData, courseSectionData, location.pathname]);

  const isFirstVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );
    const currentsubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSectionIndex === 0 && currentsubSectionIndex === 0) {
      return true;
    } else {
      return false;
    }
  };

  const isLastVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );
    const noOfSubSection =
      courseSectionData[currentSectionIndex].subSection.length;
    const currentsubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (
      currentSectionIndex === courseSectionData.length - 1 &&
      currentsubSectionIndex === noOfSubSection - 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  const goToNextVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );
    const noOfSubSection =
      courseSectionData[currentSectionIndex].subsection.length;
    const currentsubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((data) => data._id === subSectionId);
    if (currentsubSectionIndex !== noOfSubSection - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndex].subSection[
          currentSectionIndex + 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      );
    } else {
      const nextSectionId = courseSectionData[currentSectionIndex + 1];
      const nextSubSectionId =
        courseSectionData[currentSectionIndex + 1].subsection[0]._id;

      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      );
    }
  };
  const goToPrevVideo = () => {
    if (isFirstVideo()) {
      return;
    }
    const currentSectionIndex = courseSectionData?.findIndex(
      (section) => section._id === sectionId
    );
    const currentSubsectionIndex = courseSectionData[
      currentSectionIndex
    ]?.subSection.findIndex((subsection) => subsection._id === subSectionId);
    if (currentSubsectionIndex === 0) {
      const previousSectionId = courseSectionData[currentSectionIndex - 1]._id;
      const previousSubsectionId =
        courseSectionData[currentSectionIndex - 1]?.subSection[
          courseSectionData[currentSectionIndex - 1].subSection.length - 1
        ]._id;
      navigate(
        `/dashboard/enrolled-courses/view-course/${courseId}/section/${previousSectionId}/sub-section/${previousSubsectionId}`
      );
    } else {
      const previousSectionId = courseSectionData[currentSectionIndex]?._id;
      const previousSubsectionId =
        courseSectionData[currentSectionIndex]?.subSection[
          currentSubsectionIndex - 1
        ]._id;
      navigate(
        `/dashboard/enrolled-courses/view-course/${courseId}/section/${previousSectionId}/sub-section/${previousSubsectionId}`
      );
    }
  };

  const handleLectureCompletion = async () => {
    setLoading(true);

    const res = await markLectureAsComplete({userId:user._id,courseId:courseId,subSectionId:subSectionId},token);
    if(res){
      dispatch(updateCompletedLectures(subSectionId));
    }


    setLoading(false);
  };

  return <div className='md:w-[calc(100vw-320px)] w-screen p-3'>

    {
      !videoData ? (<div>
        No DataFound
      </div>):(
        <div>
        <Player className="w-full relative"
          ref={playerRef}
          src={videoData.videoUrl}
          aspectRatio="16:9"
          fluid="true"
          autoPlay={false}
          onEnded={() => setVideoEnded(true)}
        >
          
          <BigPlayButton position="center" />

          <LoadingSpinner />
          <ControlBar>
          <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
          <ReplayControl seconds={5} order={7.1} />
          <ForwardControl seconds={5} order={7.2} />
          <TimeDivider order={4.2} />
          <CurrentTimeDisplay order={4.1} />
          <TimeDivider order={4.2} />
          </ControlBar>
          {
            videoEnded && (
              <div className='flex justify-center items-center'>
              <div className='flex justify-center items-center'>
                {
                  !completedLectures.includes(videoData._id) && (
                    <button onClick={()=>{handleLectureCompletion()}} className='bg-yellow-100 text-richblack-900 absolute top-[20%] hover:scale-90 z-20 font-medium md:text-sm px-4 py-2 rounded-md'>Mark as Completed</button>
                  )
                }
              </div>
              {
                !isFirstVideo() && (
                  <div className=' z-20 left-0 top-1/2 transform -translate-y-1/2 absolute m-5'>
                    <BiSkipPreviousCircle onClick={goToPrevVideo} className=" text-2xl md:text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90"/>
                    {/* <button onClick={previousLecture} className='bg-blue-500 text-white px-4 py-2 rounded-md'>Previous Lecture</button> */}
                  </div>
                )

              }
              {
                !isLastVideo() && (
                  <div className=' z-20 right-4 top-1/2 transform -translate-y-1/2 absolute m-5'>
                    <BiSkipNextCircle onClick={goToNextVideo} className="text-2xl md:text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90"/>
                    {/* <button onClick={nextLecture} className='bg-blue-500 text-white px-4 py-2 rounded-md'>Next Lecture</button> */}
                    </div>
                )
              }
              {
                <MdOutlineReplayCircleFilled onClick={() =>{ playerRef.current.seek(0);playerRef.current.play();setVideoEnded(false)}} className="text-2xl md:text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90 absolute top-1/2 z-20"/>
              }
              </div>
            )
          }
        </Player>
      </div>
    )
      
    }
    <div className='mt-5'>
        <h1 className='text-2xl font-bold text-richblack-25'>{videoData?.title}</h1>
        <p className='text-gray-500 text-richblack-100'>{videoData?.description}</p>
        </div>

  </div>;
};

export default VideoDetails;
