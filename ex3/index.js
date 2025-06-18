require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();

app.use(express.json());
app.use(express.static('dist'));
app.use(morgan('tiny'));

app.get('/api/persons', (request, response) => {
	Person.find({}).then((persons) => {
		response.json(persons);
	});
});

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person);
			} else {
				response.statusCode(404).end();
			}
		})
		.catch((err) => next(err));
});

app.get('/info', (request, response) => {
	const date = new Date();
	Person.countDocuments({}).then((count) => {
		response.send(
			`<p>Phonebook has info for ${count} people</p><p>${date}</p>`
		);
	});
});

app.delete('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	Person.findByIdAndDelete(id).then(() => {
		response.status(204).end();
	});
});

morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

app.post('/api/persons', (request, response, next) => {
	const body = request.body;

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person
		.save()
		.then((savedPerson) => {
			response.json(savedPerson);
		})
		.catch((err) => next(err));
});

app.put('/api/persons/:id', (request, response, next) => {
	const { number } = request.body;

	Person.findByIdAndUpdate(
		request.params.id,
		{ number },
		{ new: true, runValidators: true }
	)
		.then((updatedPerson) => {
			response.json(updatedPerson);
		})
		.catch((err) => {
			next(err);
		});
});

const errorHandler = (err, request, response, next) => {
	console.log(err.message);

	if (err.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });
	} else if (err.name === 'ValidationError') {
		return response.status(400).json({ error: err.message });
	}

	next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
