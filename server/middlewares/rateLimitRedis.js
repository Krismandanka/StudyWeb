
// import { redis } from "..";
const {redis} = require("../index.js")

// const client = createClient({
//     password: '0yScEXMAufjYd75gKQtVTTV25JSK0jcB',
//     socket: {
//         host: 'redis-12089.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 12089
//     }
// });

exports.rateLimiter = (limit,timer)=>async(req,res,next)=>{
    const clientIp = req.headers["x-forwarded-for"]||req.socket.remoteAddress;
    const key = `${clientIp}:request_count`;
    const requestCount = await redis.incr(key);
    if(requestCount===1){
        await redis.expire(key,timer);
    }

    if(requestCount>limit){
        return res.status(429).send("too many req");
    }
    next();
}