const logger = require('./logger');

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
	}

	next(err);
};

const checkBlogAttributes = (req, res, next) => {
	if (
		req.body.author === undefined ||
		req.body.title === undefined ||
		req.body.url === undefined
	) {
		return res.status(400).json({ error: 'Missing required blog fields' });
	}

	if (req.body.likes === undefined) {
		req.body.likes = 0;
	}

	next();
};

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	checkBlogAttributes,
};
