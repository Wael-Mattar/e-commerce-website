var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	
	unique_id: Number,
	email: String,
	username: String,
	password: String,
	role: {
		type: String,
		default: "User"
	}
}),
User = mongoose.model("User", userSchema);
module.exports = User;




