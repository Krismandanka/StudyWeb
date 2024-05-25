import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { buyCourse } from "../services/operations/studentFeaturesAPI";
import { useState } from "react";
import { useEffect } from "react";
import { fetchCourseDetails } from "../services/operations/couseDetailsAPI";
import GetAvgRating from "../utils/avgRating";
import RatingStars from "../Components/common/RatingStars";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsGlobe } from "react-icons/bs";
import { FaShareSquare } from "react-icons/fa";
import { IoVideocamOutline } from "react-icons/io5";
import { ACCOUNT_TYPE } from "../utils/constants";
import { addToCart } from '../slices/cartSlice';

import { FaChevronDown } from "react-icons/fa";

const CourseDetails = () => {
  
  // const { user } = useSelector((state) => state.profile);
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);

  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const { cart } = useSelector((state) => state.cart);

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        const response = await fetchCourseDetails(courseId, dispatch);
        // console.log("getCourseDetails -> response", response);
        setCourseData(response);
        console.log("course details", response);
        // console.log(courseData?.ratingAndReviews)
      } catch (error) {
        console.log("course details page could not fetch details");
      }
    };
    getCourseDetails();
  }, [courseId]);

  const [avgReviewCount, setAverageReviewCount] = useState(0);
  useEffect(() => {
    if (courseData?.ratingAndReviews?.length > 0) {
      const count = GetAvgRating(courseData?.ratingAndReviews);
      setAverageReviewCount(count);
      console.log("getCourseDetails -> count", parseInt(count));
    }
  }, [courseData]);

  const [totalNoOfLecture, setTotalNoOfLecture] = useState(0);

  // useEffect(()=>{
  //   let lecture =0;
  //   response?.data?.CourseDetails?.courseContent?.forEach((sec)=>{
  //     lecture+=sec.subSection.length||0
  //   })
  //   setTotalNoOfLecture(lecture);
  //   console.log("total lex",lecture);

  // },[courseData])

  useEffect(() => {
    if (courseData) {
      const Enrolled = courseData?.studentsEnrolled?.find(
        (student) => student === user?._id
      );
      console.log("CourseDetails -> Enrolled", Enrolled)
      if (Enrolled) {
        
        setAlreadyEnrolled(true);
      }
    }
  }, [courseData, user?._id]);

  

  const handelPayment = () => {
    if(token){
        buyCourse(token,[courseId],user,navigate,dispatch);
    }
    else{
        navigate('/login');
    }
}


  const handelAddToCart = () => {
    if(token){
    dispatch(addToCart(courseData));
    // console.log("handelAddToCart -> courseId", courseDetail._id)
    }
    else{
        navigate('/login');
    }
}

  if (loading || !courseData) {
    return <div>Loading...</div>;
  }
  if (!courseData) {
    return <div>Error</div>;
  }

  return (
    <div className="">
      
      <div className="mx-auto box-content px-4 lg:w-[1260px] lg:relative">
        <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
          <div className="relative block max-h-[30rem] lg:hidden">
            <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
            <img src={courseData?.thumbnail} alt="course img" />
          </div>

          <div className="z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5">
            <p className="text-4xl font-bold text-richblack-5 sm:text-[42px]">
              {courseData?.courseName}
            </p>
            <p className="text-richblack-200">
              {courseData?.courseDescription}
            </p>
            <div className="flex gap-x-3 items-center">
              <span className="text-yellow-50">{avgReviewCount || 0}</span>
              <RatingStars Review_Count={avgReviewCount} />
              <span className=" md:block hidden md:text-xl text-richblack-5">
                ({courseData?.ratingAndReviews?.length} Reviews)
              </span>
              {/* student enrolled */}
              <span className="text-richblack-200">
                {courseData?.studentsEnrolled?.length} students enrolled
              </span>
            </div>
            <div>
              <p>
                Created By {courseData?.instructor?.firstName}{" "}
                {courseData?.instructor?.lastName}
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-lg">
              <AiOutlineInfoCircle className="text-2xl text-richblack-5" />
              <p className="text-richblack-50">
                Created at &nbsp;
                {new Date(
                  courseData?.createdAt || courseData?.updatedAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="flex items-center gap-2 text-richblack-50">
                <BsGlobe className="text-lg text-richblack-50" />
                English
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 ">
            <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-5">
              <span>₹{courseData?.price}</span>
            </p>
            {ACCOUNT_TYPE.INSTRUCTOR !== user?.accountType && (
              <div>
                {
                  // alreadyEnrolled ? <button onClick={()=>{navigate("/dashboard/enrolled-courses")}}  className='yellowButton'>Go to Course</button> : <button onClick={handelPayment} className='yellowButton'>Buy Now</button>
                  alreadyEnrolled ? (
                    <button
                      onClick={() => {
                        navigate("/dashboard/enrolled-courses");
                      }}
                      className="yellowButton"
                    >
                      Go to Course
                    </button>
                  ) : (
                    <button className="yellowButton" onClick={handelPayment}>Buy Now</button>
                  )
                }
                {alreadyEnrolled ? (
                  <div className="text-richblack-5">kuch bhbi</div>
                ) : // cart?.find((item) => item?._id === courseData?._id) ?
                // (<button onClick={()=>{navigate("/dashboard/cart")}} className='blackButton text-richblack-5'>Go to Cart</button>) :
                // (<button onClick={handelAddToCart} className='blackButton text-richblack-5'>Add to Cart</button>)
                cart?.find((item) => item?._id === courseData?._id) ? (
                  <button
                    onClick={() => {
                      navigate("/dashboard/cart");
                    }}
                    className="blackButton text-richblack-5"
                  >
                    Go to Cart
                  </button>
                ) : (
                  <button className="blackButton text-richblack-5" onClick={handelAddToCart}>
                    Add to Cart
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          <div className="my-8 border border-richblack-600 p-8">
            <p className="text-3xl font-semibold">what you learn</p>
            <div className="mt-5">{courseData?.whatYouWillLearn}</div>
          </div>

          <div className="max-w-[830px]">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold">course Content</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>{courseData?.courseContent?.length} section(s)</span>
                  <span>
                    {courseData?.courseContent?.reduce(
                      (acc, item) => acc + item?.subSection?.length,
                      0
                    )}{" "}
                    Lecture(s){" "}
                  </span>
                </div>
                <button className="text-yellow-25">
                  <span>Collapse all sections</span>
                </button>
              </div>
            </div>

            <div className="py-4">
              {courseData?.courseContent?.map((item, index) => (
                <details
                  key={index}
                  className="border border-solid border-richblack-600 bg-richblack-700 text-richblack-5 detailanimatation px-2"
                >
                  <summary className="flex curser-pointer items-start justify-between bg-opacity-20 px-7py-5 transition-[1s] py-2">
                    <div className="flex items-center gap-2">
                      <FaChevronDown className="arrow " />
                      <span className="text-xl p-2">{item?.sectionName}</span>
                    </div>
                    <div className="space-x-4">
                      <span className="text-yellow-25 px-2 py-auto">
                        {item?.subSection?.length} Lecture(s)
                      </span>
                    </div>
                  </summary>
                  <div className="mt-5">
                    {item?.subSection?.map((subItem, subIndex) => (
                      <div
                        key={subIndex}
                        className="relative overflow-hidden bg-richblack-900  p-5 border border-solid border-richblack-600"
                      >
                        <div className="flex items-center gap-2">
                          <IoVideocamOutline className="txt-lg text-richblack-5" />
                          <span className="text-lg">{subItem?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-12 py-4"></div>
        <p className="text-[28px] font-semibold">Author</p>
        <div className="flex items-center gap-4 py-4">
          <img
            src={courseData?.instructor.image}
            alt="author img"
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
          <p className="text-xl font-semibold">
            {courseData?.instructor?.firstName}{" "}
            {courseData?.instructor?.lastName}
          </p>
        </div>
        <p className="text-richblack-50 text-sm mb-10">
          {courseData?.instructor?.additionalDetails?.about}
        </p>
      </div>
      
      
    </div>
    
  );
};

export default CourseDetails;



{/* <div className="flex flex-col justify-start px-5 reative text-richblack-100 bg-richblack-800">
        <div className="z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5">
          <p className="text-4xl font-bold text-richblack-5 sm:text-[42px]">
            {courseData?.courseName}
          </p>
          <p className="text-richblack-200">{courseData?.courseDescription}</p>
          <div className="flex gap-x-3 items-center">
            <span className="text-yellow-50">{avgReviewCount || 0}</span>
            <RatingStars Review_Count={avgReviewCount} />
            <span className=" md:block hidden md:text-xl text-richblack-5">
              ({courseData?.ratingAndReviews?.length} Reviews)
            </span>
            <span className="text-richblack-200">
              {courseData?.studentsEnrolled?.length} students enrolled
            </span>
          </div>

          <div>created by {courseData?.instructor?.firstName}</div>
          <div className="flex flex-wrap gap-5 text-lg">
            <AiOutlineInfoCircle className="text-2xl text-richblack-5" />
            <p className="text-richblack-50">
              Created at &nbsp;
              {new Date(
                courseData?.createdAt || courseData?.updatedAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="flex items-center gap-2 text-richblack-50">
              <BsGlobe className="text-lg text-richblack-50" />
              English
            </p>
          </div>
        </div>
      </div> */}