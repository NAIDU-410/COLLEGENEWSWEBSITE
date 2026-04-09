import React from 'react';
import CreateEvent from './CreateEvent';

// We can reuse CreateEvent for editing by passing the ID from the URL
const EditEvent = () => {
    return <CreateEvent />;
};

export default EditEvent;
