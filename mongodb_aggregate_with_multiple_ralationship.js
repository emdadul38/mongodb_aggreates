let looksee_user_id = req.body.user_id;

//  Receiving looksee from distinct user's
await LookseeAssignee.aggregate([
    { '$match': {"receipient_user": mongoose.Types.ObjectId(looksee_user_id)}},
    { "$lookup": {
        "from": "looksees",
        "localField": "looksee_id", // name of LookseeAssignee table field
        "foreignField": "_id",      // name of looksee table field
        "as": "looksee_info",
    }},
    // { "$match": { "looksee_info": { 
    //      $elemMatch: {"sender_id": mongoose.Types.ObjectId(looksee_user_id)} 
    //  } 
    // }},
    { "$unwind": "$looksee_info" },
    
    { "$lookup": {
        "from": "users",
        "localField": "looksee_info.sender_id", // name of looksee table field
        "foreignField": "_id",                  // name of users table field
        "as": "user_info",
    }},         
    //{ "$unwind": "$user_info" },

    { "$lookup": {
        "from": "kids",
        "localField": "looksee_info.sender_kid_id", // name of looksee table field
        "foreignField": "_id",                  // name of users table field
        "as": "kids_info",
    }},         
    {
        "$unwind": {
          "path": "$user_info",
          "preserveNullAndEmptyArrays": true
        }
    },
    {
        "$unwind": {
            "path": "$kids_info",
            "preserveNullAndEmptyArrays": true
        }
    },
    {
        "$project": { 
            "looksee_id": 1,
            "looksee_info.mode": 1,
            "kids_info.name": 1,
            "user_info.name":1
        }
    }
    
], function(err, users){
    res.send(users);
});


// Simple output


[
    {
        "_id": "5c939217fa1dd0bc9e932744",
        "looksee_id": "5c89f00870aa0c4bd574a40e",
        "looksee_info": {
            "mode": "Boss"
        },
        "user_info": {
            "name": "Emdadul Huq"
        }
    },
    {
        "_id": "5c939217fa1dd0bc9e932748",
        "looksee_id": "5c89f00870aa0c4bd574a40f",
        "looksee_info": {
            "mode": "Boss"
        },
        "user_info": {
            "name": "Emdadul Huq"
        }
    },
    {
        "_id": "5c939217fa1dd0bc9e93274d",
        "looksee_id": "5c89f00970aa0c4bd574a41b",
        "looksee_info": {
            "mode": "Boss"
        },
        "kids_info": {
            "name": "Yesmin Akter"
        }
    },
    {
        "_id": "5c939217fa1dd0bc9e932752",
        "looksee_id": "5c89f00870aa0c4bd574a411",
        "looksee_info": {
            "mode": "Boss"
        },
        "user_info": {
            "name": "Test Data 4856"
        }
    },
    {
        "_id": "5c939219fa1dd0bc9e932756",
        "looksee_id": "5c89f00870aa0c4bd574a412",
        "looksee_info": {
            "mode": "Boss"
        },
        "user_info": {
            "name": "Test Data 4856"
        }
    }
]
