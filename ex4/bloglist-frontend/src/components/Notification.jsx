const Notification = ({ message, messageType }) => {
  if (message === '') {
    return;
  }
  const successStyle = {
    color: '#03C04A',
    border: 'solid 3px #03C04A',
    backgroundColor: '#D3D3D3',
    padding: '10px 5px 10px 5px',
  };

  const errorStyle = {
    color: '#f01e2c',
    border: 'solid 3px #f01e2c',
    backgroundColor: '#D3D3D3',
    padding: '10px 5px 10px 5px',
  };

  let notificationStyle = null;
  if (messageType === 'success') {
    notificationStyle = successStyle;
  } else if (messageType === 'error') {
    notificationStyle = errorStyle;
  }

  return (
    <div>
      <h3 style={notificationStyle}>{message}</h3>
    </div>
  );
};

export default Notification;
