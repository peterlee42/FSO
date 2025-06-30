const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (req, res) => {
	const users = await User.find({}).populate('blogs', {
		title: 1,
		author: 1,
		url: 1,
		likes: 1,
	});
	return res.json(users);
});

usersRouter.post('/', async (req, res) => {
	const { username, name, password } = req.body;

	const saltRounds = 10;

	if (password.length < 3) {
		return res
			.status(400)
			.json({ error: 'expected `password` to be at least 3 characters long' });
	}

	const passwordHash = await bcrypt.hash(password, saltRounds);

	const user = new User({
		username,
		name,
		passwordHash,
		blogs: [],
	});

	const savedUser = await user.save();
	res.status(201).json(savedUser);
});

module.exports = usersRouter;
