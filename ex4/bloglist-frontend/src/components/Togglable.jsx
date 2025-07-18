import { useState, useImperativeHandle } from 'react';

const Togglable = ({ ref, children }) => {
	const [visible, setVisible] = useState(false);

	const showWhenVisible = { display: visible ? '' : 'none' };
	const hideWhenVisible = { display: visible ? 'none' : '' };

	const toggleVisible = () => {
		setVisible(!visible);
	};

	useImperativeHandle(ref, () => {
		return { toggleVisible };
	});

	return (
		<div>
			<div style={hideWhenVisible}>
				<button onClick={toggleVisible}>new blog</button>
			</div>
			<div style={showWhenVisible}>
				{children}
				<button onClick={toggleVisible}>cancel</button>
			</div>
		</div>
	);
};

export default Togglable;
