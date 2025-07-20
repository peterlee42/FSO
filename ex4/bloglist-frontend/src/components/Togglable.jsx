import { useState, useImperativeHandle } from 'react';
import propTypes from 'prop-types';

const Togglable = ({ buttonLabel, ref, children }) => {
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
				<button onClick={toggleVisible}>{buttonLabel}</button>
			</div>
			<div style={showWhenVisible}>
				{children}
				<button onClick={toggleVisible}>cancel</button>
			</div>
		</div>
	);
};

Togglable.propTypes = {
	buttonLabel: propTypes.string.isRequired,
};

export default Togglable;
