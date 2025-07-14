import axios from 'axios';
const baseUrl = '/api/blogs';
let token = null;

const getAll = async () => {
	const response = await axios.get(baseUrl);
	return response.data;
};

const create = async (blog) => {
	const response = await axios.post(baseUrl, blog, {
		headers: {
			Authorization: token,
		},
	});

	return response.data;
};

const setToken = (newToken) => {
	token = `Bearer ${newToken}`;
};

export default { getAll, setToken, create };
