const mongoose = require('mongoose');
const MONGOOSE_URL=process.env.MONGOOSE_URL;
mongoose.connect(MONGOOSE_URL).then(()=>{
    console.log("mongodb connected");
}).catch((error)=>{
    console.log(error)
})