await LookseeAssignee.aggregate([
		{ '$match': {"receipient_user": mongoose.Types.ObjectId(looksee_user_id)}},
		{
			'$group' : {
				_id: {
					year: { $year: '$createdAt' }, 
					month: { $month: '$createdAt' } 
				},
				count: { $sum: 1 }
			}
		},
		{'$project': {
			date: "$_id", // so this is the shorter way
			count: 1,
			_id: 0
		}},
		{ "$sort": { "date": 1 } }
						
	], async function(err, data){
		looksee_assignee_data = data;
	});

// For sending looksee for graph
await Looksee.aggregate([
	{ '$match': {"sender_id": mongoose.Types.ObjectId(looksee_user_id)}},
	{
		'$group' : {
			_id: {
				year: { $year: '$createdAt' }, 
				month: { $month: '$createdAt' } 
			},
			count: { $sum: 1 }
		}
	},
	{'$project': {
		date: "$_id", // so this is the shorter way
		count: 1,
		_id: 0
	}},
	{ "$sort": { "date": 1 } }
					
], async function(err, data){
	looksee_data = data;
});

//  Receiving looksee from distinct user's
await LookseeAssignee.aggregate([
	{ '$match': {"receipient_user": mongoose.Types.ObjectId(looksee_user_id)}},
	{ "$lookup": {
		"from": "looksees",
		"localField": "looksee_id", // name of LookseeAssignee table field
		"foreignField": "_id",		// name of looksee table field
		"as": "looksee_info",
	}},
	// { "$match": { "looksee_info": { 
	// 		$elemMatch: {"sender_id": mongoose.Types.ObjectId(looksee_user_id)} 
	// 	} 
	// }},
	{ "$unwind": "$looksee_info" },
	
	{ "$lookup": {
		"from": "users",
		"localField": "looksee_info.sender_id", // name of looksee table field
		"foreignField": "_id",					// name of users table field
		"as": "user_info",
	}},			
	{ "$unwind": "$user_info" },
	{ '$group' : {
			_id: {
				user_id:"$user_info._id",
				name:	"$user_info.name",
				country:"$user_info.country_name",
			},
			count: {$sum: 1},
		}
	}
], function(err, users){
	distinct_receiving_looksees = users;
});
//  Sending looksee from distinct user's
await Looksee.aggregate([
	{ '$match': {"sender_id": mongoose.Types.ObjectId(looksee_user_id)}},
	{ "$lookup": {
		"from": "looksee_assignees",
		"localField": "_id",			// name of looksee table field
		"foreignField": "looksee_id",	// name of looksee_assignees table field
		"as": "looksee_assignee_info",
	}},
	// { "$match": { "looksee_info": { 
	// 		$elemMatch: {"sender_id": mongoose.Types.ObjectId(looksee_user_id)} 
	// 	} 
	// }},
	{ "$unwind": "$looksee_assignee_info" },
	
	{ "$lookup": {
		"from": "users",
		"localField": "looksee_assignee_info.receipient_user", 	// name of looksee_assignees table field
		"foreignField": "_id",									// name of users table field
		"as": "user_info",
	}},			
	{ "$unwind": "$user_info" },
	{ '$group' : {
		_id: {
			user_id:"$user_info._id",
			name:	"$user_info.name",
			country:"$user_info.country_name",
		},
		count: {$sum: 1},
		}
	}
], function(err, users){
	distinct_sending_looksees = users;
});

// Receiving looksee
await LookseeAssignee.aggregate([
	{ '$match': {"receipient_user": mongoose.Types.ObjectId(looksee_user_id), "is_seen": false}},
	{ "$lookup": {
		"from": "looksees",
		"localField": "looksee_id",	// name of LookseeAssignee table field
		"foreignField": "_id",		// name of Looksee table field
		"as": "looksee_info",
	}},
	{ "$match": { "looksee_info": { 
			$elemMatch: {"offer_id": "1"} 
		} 
	}},
	{ "$unwind": "$looksee_info" },
	{ "$lookup": {
		"from": "users",
		"localField": "looksee_info.sender_id", // name of Looksee table field
		"foreignField": "_id",					// name of users table field
		"as": "user_info",
	}},
	{ "$unwind": "$user_info" },
	{
		"$project": {
			"looksee_info": 1,
			"is_accepted": 1,
			"accepted_time": 1,
			"is_rejected": 1,
			"rejected_time": 1,
			"is_completed": 1,
			"completed_time": 1,
			"is_abandoned": 1,
			"abandoned_time": 1,
			"user_info.name": 1
		}
	}
], function(err, receive_looksees){
	res.render('admin/looksee_user/user_profile', { distinct_receiving_looksees: distinct_receiving_looksees, distinct_sending_looksees:distinct_sending_looksees, looksee_data:looksee_data, looksee_assignee_data: looksee_assignee_data, looksee_user: looksee_user, sending_looksees: sending_looksees, receive_looksees:receive_looksees, 'title': 'Looksee user Profile' });
});