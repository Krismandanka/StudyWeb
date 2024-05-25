const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {paymentSuccess} = require("../mail/templates/paymentSuccess");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");


exports.capturePayment = async (req, res) => {
    //get courseId and UserID
    const {courses} = req.body;
    const userId = req.user.id;
    console.log("ppp",req.body);
    //validation
    //valid courseID
    try{
        console.log("lll",courses)
    if(courses.length === 0) {
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        })
    };

    let totalAmount = 0;
    console.log("kkkkkkkkkkkkkkkkkk")

    for(const course_id of courses){
        let course;
        // console.log("courseid=",course_id);
        try{
            course = await Course.findById(course_id);
            if(!course) {
                return res.json({
                    success:false,
                    message:'Could not find the course',
                });
            }
    
            //user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({
                    success:false,
                    message:'Student is already enrolled',
                });
            }
            totalAmount += course.price;
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
        // totalAmount += course.price;
    }
        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString(),
        };

        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log("payment",paymentResponse);
            //return response
            return res.status(200).json({
                success:true,
                orderId: paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    
};



    //verify the signature
exports.verifySignature = async (req, res) => {
        //get the payment details
        // const {razorpay_payment_id, razorpay_order_id, razorpay_signature} = req.body;
        // console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",req.body)
        // console.log("verifyyyyyyyyyyyyyyyyyyyyyyyyyy",req);
        // const {courses} = req.body;
        // const userId = req.user.id;


        // // if(!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        // //     return res.status(400).json({
        // //         success:false,
        // //         message:'Payment details are incomplete',
        // //     });
        // // }

        // // let body = razorpay_order_id + "|" + razorpay_payment_id;

        // const enrolleStudent = async (courses, userId) => {
        //     if(!courses || !userId) {
        //         return res.status(400).json({
        //             success:false,
        //             message:'Please provide valid courses and user ID',
        //         });
        //     }
        //             try{
        //                 //update the course
        //                 for(const course_id of courses){
        //                 console.log("verify courses=",course_id);
        //                 const course = await Course.findByIdAndUpdate(
        //                     course_id,
        //                     {$push:{studentsEnrolled:userId}},
        //                     {new:true}
        //                 );
        //                 //update the user
        //                 const user = await User.updateOne(
        //                     {_id:userId},
        //                     {$push:{courses:course_id}},
        //                     {new:true}
        //                 );
        //                 //set course progress
        //                 const newCourseProgress = new CourseProgress({
        //                     userID: userId,
        //                     courseID: course_id,
        //                   })
        //                   await newCourseProgress.save()
                    
        //                   //add new course progress to user
        //                   await User.findByIdAndUpdate(userId, {
        //                     $push: { courseProgress: newCourseProgress._id },
        //                   },{new:true});
        //                 //send email
        //                 const recipient = await User.findById(userId);
        //                 console.log("recipient=>",course);
        //                 const courseName = course.courseName;
        //                 const courseDescription = course.courseDescription;
        //                 const thumbnail = course.thumbnail;
        //                 const userEmail = recipient.email;
        //                 const userName = recipient.firstName + " " + recipient.lastName;
        //                 const emailTemplate = courseEnrollmentEmail(courseName,userName, courseDescription, thumbnail);
        //                 await mailSender(
        //                     userEmail,
        //                     `You have successfully enrolled for ${courseName}`,
        //                     emailTemplate,
        //                 );
        //                 }
        //                 return res.status(200).json({
        //                     success:true,
        //                     message:'Payment successful',
        //                 });
        //             }
        //             catch(error) {
        //                 console.error(error);
        //                 return res.status(500).json({
        //                     success:false,
        //                     message:error.message,
        //                 });
        //             }
                
        //     }

        // try{
        //     //verify the signature
        //     const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex");
        //     if(generatedSignature === razorpay_signature) {
        //         await enrolleStudent(courses, userId);
        //     }

        // }
        // catch(error) {
        //     console.error(error);
        //     return res.status(500).json({
        //         success:false,
        //         message:error.message,
        //     });
        // }


        const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  console.log("fiiii")
  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")


    console.log("seeeeeeee")

  if (expectedSignature === razorpay_signature) {
    console.log("threee")
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })

     
    }




//send email

exports.sendPaymentSuccessEmail = async (req, res) => {
    const {amount,paymentId,orderId} = req.body;
    const userId = req.user.id;
    if(!amount || !paymentId) {
        return res.status(400).json({
            success:false,
            message:'Please provide valid payment details',
        });
    }
    try{
        const enrolledStudent =  await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Study Notion Payment successful`,
            paymentSuccess(amount/100, paymentId, orderId, enrolledStudent.firstName, enrolledStudent.lastName),
        );
}
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}



const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID and User ID" })
    }
  
    for (const courseId of courses) {
      try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnroled: userId } },
          { new: true }
        )
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" })
        }
        console.log("Updated course: ", enrolledCourse)
  
        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
        // Find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        )
  
        console.log("Enrolled student: ", enrolledStudent)
        // Send an email notification to the enrolled student
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
  
        console.log("Email sent successfully: ", emailResponse.response)
      } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: error.message })
      }
    }
  }





















//capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//     //get courseId and UserID
//     const {course_id} = req.body;
//     const userId = req.user.id;
//     //validation
//     //valid courseID
//     if(!course_id) {
//         return res.json({
//             success:false,
//             message:'Please provide valid course ID',
//         })
//     };
//     //valid courseDetail
//     let course;
//     try{
//         course = await Course.findById(course_id);
//         if(!course) {
//             return res.json({
//                 success:false,
//                 message:'Could not find the course',
//             });
//         }

//         //user already pay for the same course
//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)) {
//             return res.status(200).json({
//                 success:false,
//                 message:'Student is already enrolled',
//             });
//         }
//     }
//     catch(error) {
//         console.error(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//         });
//     }
    
//     //order create
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount * 100,
//         currency,
//         receipt: Math.random(Date.now()).toString(),
//         notes:{
//             courseId: course_id,
//             userId,
//         }
//     };

//     try{
//         //initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);
//         //return response
//         return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId: paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount,
//         });
//     }
//     catch(error) {
//         console.log(error);
//         res.json({
//             success:false,
//             message:"Could not initiate order",
//         });
//     }
    

// };

// //verify Signature of Razorpay and Server

// exports.verifySignature = async (req, res) => {
//     const webhookSecret = "12345678";

//     const signature = req.headers["x-razorpay-signature"];

//     const shasum =  crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest) {
//         console.log("Payment is Authorised");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//                 //fulfil the action

//                 //find the course and enroll the student in it
//                 const enrolledCourse = await Course.findOneAndUpdate(
//                                                 {_id: courseId},
//                                                 {$push:{studentsEnrolled: userId}},
//                                                 {new:true},
//                 );

//                 if(!enrolledCourse) {
//                     return res.status(500).json({
//                         success:false,
//                         message:'Course not Found',
//                     });
//                 }

//                 console.log(enrolledCourse);

//                 //find the student andadd the course to their list enrolled courses me 
//                 const enrolledStudent = await User.findOneAndUpdate(
//                                                 {_id:userId},
//                                                 {$push:{courses:courseId}},
//                                                 {new:true},
//                 );

//                 console.log(enrolledStudent);

//                 //mail send krdo confirmation wala 
//                 const emailResponse = await mailSender(
//                                         enrolledStudent.email,
//                                         "Congratulations from CodeHelp",
//                                         "Congratulations, you are onboarded into new CodeHelp Course",
//                 );

//                 console.log(emailResponse);
//                 return res.status(200).json({
//                     success:true,
//                     message:"Signature Verified and COurse Added",
//                 });


//         }       
//         catch(error) {
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         });
//     }


// };