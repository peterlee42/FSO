const logger = require('./logger');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const requestLogger = (req, res, next) => {
	logger.info('Method', req.method);
	logger.info('Path', req.path);
	logger.info('Body', req.body);
	logger.info('---');
	next();
};

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unkown endpoint' });
};

const errorHandler = (err, req, res, next) => {
	if (err.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' });
	} else if (
		err.name === 'ValidationError' &&
		err.message.includes('username: Path `username`') &&
		err.message.includes('shorter than the minimum allowed length (3)')
	) {
		return res
			.status(400)
			.send({ error: 'expected `username` to be at least 3 characters long' });
	} else if (err.name === 'ValidationError') {
		return res.status(400).send({ error: err.message });
	} else if (
		err.name === 'MongoServerError' &&
		err.message.includes('E11000 duplicate key error')
	) {
		return res.status(400).send({ error: 'expected `username` to be unique' });
	} else if (err.name === 'JsonWebTokenError') {
		return res.status(401).send({ error: 'token invalid' });
	} else if (err.name === 'TokenExpiredError') {
		return res.status(403).send({ error: 'token has expired' });
	}

	next(err);
};

const setDefaultBlogFields = (req, res, next) => {
	if (req.body.likes === undefined) {
		req.body.likes = 0;
	}

	next();
};

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization');
	if (authorization && authorization.startsWith('Bearer ')) {
		req.token = authorization.replace('Bearer ', '');
	} else {
		req.token = null;
	}

	next();
};

const userExtractor = async (req, res, next) => {
	try {
		const decodedToken = jwt.verify(req.token, process.env.SECRET);

		if (!decodedToken.id) {
			return res.status(401).json({ error: 'token invalid' });
		}

		const user = await User.findById(decodedToken.id);
		if (!user) {
			return res.status(401).json({ error: 'userId missing or not valid' });
		}
		req.user = user;
		next();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	setDefaultBlogFields,
	tokenExtractor,
	userExtractor,
};
