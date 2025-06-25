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
	logger.error(err);

	if (err.name === 'CastError') {
		req.status(400).send({ error: 'malformatted id' });
	} else if (err.name === 'ValidationError') {
		req.status(400).send({ error: err.message });
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
