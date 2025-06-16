const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose
	.connect(url)
	.then(() => {
		console.log('connected to MongoDB');
	})
	.catch((err) => {
		console.log('error connecting to MongoDB', err.message);
	});

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: [true, 'Contact name required'],
	},
	number: {
		type: String,
		minLength: 8,
		validate: {
			validator: (v) => {
				const parts = v.split('-');

				if (parts.length != 2) {
					return false;
				}

				if (parts[0].length !== 2 && parts[0].length !== 3) {
					return false;
				}

				const numbers = new Set([
					'1',
					'2',
					'3',
					'4',
					'5',
					'6',
					'7',
					'8',
					'9',
					'0',
				]);

				for (const n of [...parts[0], ...parts[1]]) {
					if (!numbers.has(n)) {
						return false;
					}
				}

				return true;
			},
			message: (props) =>
				`${props.value} must be formed of two parts that are separated by -, the first part has two or three numbers and the second part also consists of numbers`,
		},
	},
});

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

module.exports = mongoose.model('Person', personSchema);
