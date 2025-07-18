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

const update = async (blog) => {
	const response = await axios.put(`${baseUrl}/${blog.id}`, blog, {
		headers: {
			Authorization: token,
		},
	});

	return response.data;
};

const setToken = (newToken) => {
	token = `Bearer ${newToken}`;
};

const verifyToken = (savedToken) => {
	const payload = JSON.parse(atob(savedToken.split('.')[1]));
	if (payload?.exp * 1000 >= Date.now()) {
		return true;
	} else {
		return false;
	}
};

export default { getAll, setToken, create, update, verifyToken };
