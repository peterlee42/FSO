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

const remove = async (blogId) => {
	const response = await axios.delete(`${baseUrl}/${blogId}`, {
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
	const base64Url = savedToken.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const payload = JSON.parse(window.atob(base64));

	if (payload?.exp >= Date.now() / 1000) {
		return true;
	} else {
		return false;
	}
};

export default { getAll, setToken, create, update, verifyToken, remove };
