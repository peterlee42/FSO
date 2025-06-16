import { useState, useEffect } from 'react';

import phonebookService from './services/phonebook';

import Notification from './components/Notification';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';

const App = () => {
	const [persons, setPersons] = useState([]);

	const [message, setMessage] = useState(null);
	const [messageType, setMessageType] = useState('');
	const [newName, setNewName] = useState('');
	const [newNumber, setNewNumber] = useState('');
	const [searchName, setSearchName] = useState('');

	useEffect(() => {
		phonebookService.getAll().then((personsData) => {
			setPersons(personsData);
		});
	}, []);

	const addPerson = (e) => {
		e.preventDefault();

		const normalizedNewName = newName.trim().toLowerCase();
		const existingPerson = persons.find(
			(person) => person.name.toLowerCase() === normalizedNewName
		);

		const personObject = {
			name: newName.trim(),
			number: newNumber.trim(),
		};

		if (existingPerson) {
			const confirmUpdate = window.confirm(
				`${newName} is already added to the phonebook, replace the old number with a new one?`
			);

			if (confirmUpdate) {
				phonebookService
					.update(existingPerson.id, personObject)
					.then((returnedPerson) => {
						setPersons(
							persons.map((person) =>
								person.id !== returnedPerson.id ? person : returnedPerson
							)
						);
						setNewName('');
						setNewNumber('');
						setMessage(`Changed number for ${returnedPerson.name}`);
						setMessageType('success');
					})
					.catch((err) => {
						setMessage(err.response.data.error);
						setMessageType('error');
					});
			}
		} else {
			phonebookService
				.create(personObject)
				.then((returnedPerson) => {
					setPersons(persons.concat(returnedPerson));
					setNewName('');
					setNewNumber('');
					setMessage(`Added ${returnedPerson.name}`);
					setMessageType('success');
				})
				.catch((err) => {
					setMessage(err.response.data.error);
					setMessageType('error');
				});

			setTimeout(() => {
				setMessage(null);
				setMessageType('');
			}, 5000);
		}
	};

	const handleNewName = (e) => setNewName(e.target.value);
	const handleNewNumber = (e) => setNewNumber(e.target.value);
	const handleSearchName = (e) => setSearchName(e.target.value);

	const deletePerson = (personObject) => {
		if (window.confirm('Are you sure you want to delete this contact?')) {
			phonebookService
				.deleteID(personObject.id)
				.then(() => {
					setPersons(persons.filter((person) => person.id !== personObject.id));
				})
				.catch(() => {
					setMessage(
						`Information of ${personObject.name} has already been removed from server`
					);
					setMessageType('error');
				});
		}
	};

	const peopleToShow = !searchName
		? persons
		: persons.filter((person) =>
				person.name.toLowerCase().includes(searchName.toLowerCase())
		  );

	return (
		<div>
			<h2>Phonebook</h2>

			<Notification message={message} messageType={messageType} />

			<Filter searchName={searchName} handleSearchName={handleSearchName} />

			<h2>Add a New Person</h2>

			<PersonForm
				addPerson={addPerson}
				newName={newName}
				handleNewName={handleNewName}
				newNumber={newNumber}
				handleNewNumber={handleNewNumber}
			/>

			<h2>Numbers</h2>
			<Persons persons={peopleToShow} deletePerson={deletePerson} />
		</div>
	);
};

export default App;
