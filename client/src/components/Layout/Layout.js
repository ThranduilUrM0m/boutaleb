import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
