const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const User = require('../models/User');
const { query } = require("express");
const router = require("express").Router();

router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        if (req.body.password) {
            console.log(req.body.password);
            req.body.password = CryptoJS.AES.encrypt(
                req.body.password,
                process.env.PASS_ESC
            ).toString();
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            { new: true });
        return res.json({
            msg: "success",
            user: updatedUser
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err.message);
    }
});

//GET USER
router.get("/find/:id",verifyTokenAndAdmin,async(req,res)=>{
    try{
        const user=await User.findById(req.params.id);
        const {password,...others}=user._doc;
        res.status(200).json(others);

    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});


//DELETE USER
router.delete("/:id",verifyTokenAndAuthorization,async(req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted..")

    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

//GET ALL USER
router.get("/",verifyTokenAndAdmin,async(req,res)=>{
    const query=req.query.new;

    try{
        const users=query 
        ? await User.find().sort({_id:-1}).limit(5)
        : await User.find();
        res.status(200).json(users);


    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

//GET USES STATS

router.get("/stats",verifyTokenAndAdmin,async(req,res)=>{
    const date=new Date();
    const lastYear=new Date(date.setFullYear(date.getFullYear()-1));

    try{
        const data=await User.aggregate([
            {$match:{createdAt:{$gte:lastYear}}},
            {
                $project:{
                    month:{$month:"$createdAt"},
                },
            },
            {
                $group:{
                    _id:"$month",
                    total:{$sum:1},
                }
            }
        ]);
        res.status(200).json(data);

    }catch(err){(err);
    }
})



module.exports = router;