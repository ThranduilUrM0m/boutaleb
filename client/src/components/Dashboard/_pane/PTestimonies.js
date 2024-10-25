// React
import React from 'react';

// SimpleBar for Virtual Scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const PTestimonies = (props) => {
    return (
        <div className='_pane d-flex flex-column'>
            <div className='_header'></div>
            <div className='_body flex-grow-1'>
                <SimpleBar
                    style={{ maxHeight: '100%' }}
                    forceVisible='y'
                    autoHide={false}
                >
                    <div>_testimonies</div>
                </SimpleBar>
            </div>
        </div>
    );
};

export default PTestimonies;
