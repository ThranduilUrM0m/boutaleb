import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = (props) => {
    return (
        <>
            {/* A 'layout route' is a good place to put markup you want to
                share across all the pages on your site, like navigation. */}
            <Header />
            {/* An <Outlet> renders whatever child route is currently active,
                so you can think about this <Outlet> as a placeholder for
                the child routes we defined above. */}
            <Outlet />
            <Footer />
        </>
    );
}

export default Layout;