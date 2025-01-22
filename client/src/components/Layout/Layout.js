// React and Routing
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Custom Components
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = () => {
    let location = useLocation();

    return (
        <>
            {location.pathname !== '/dashboard' && <Header />}
            <Outlet />
            {location.pathname !== '/dashboard' && <Footer />}
        </>
    );
};

export default Layout;
