const getPayloadData = (token) => {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const payload = JSON.parse(window.atob(base64));
	return payload;
};

const checkTokenExpiry = (token) => {
	const payload = getPayloadData(token);

	if (payload?.exp >= Date.now() / 1000) {
		return true;
	} else {
		return false;
	}
};

const getUserId = (token) => {
	const payload = getPayloadData(token);
	return payload.id.toString();
};

export default { checkTokenExpiry, getUserId };
