import React, { useEffect } from 'react';
import { _useStore } from './store/store';
import {
	Route,
	Routes
} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Login from './components/Login/Login.js';
import Signup from './components/Signup/Signup.js';
import Confirmation from './components/Confirmation/Confirmation';
import Blog from './components/Blog/Blog';
import Post from './components/Post/Post';
import Dashboard from './components/Dashboard/Dashboard';
import Process from './components/Process/Process';
import AboutUs from './components/AboutUs/AboutUs';
import Feedback from './components/Feedback/Feedback';
import NotFound from './components/NotFound/NotFound';
import RequireAuth from './components/RequireAuth';
import _ from 'lodash';
import { io } from "socket.io-client";

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
    ? window.location.hostname
    : 'localhost:8800';
const _socket = io(_socketURL, { 'transports': ['websocket', 'polling'] });

let App = (props) => {
	useEffect(() => {
		/* _socket.on('action', (action) => {
            switch (action.type) {
                case '_userConnectedLoad':
                    setUsers(action.data.users);
                    break;
                case '_userDisonnectedLoad':
                    setUsers(action.data.users);
                    break;
                case '_userCreatedLoad':
                    setUsers(action.data.users);
                    break;
                case '_userConfirmedLoad':
                    setUsers(action.data.users);
                    break;
                default:
                    return false;
            }
        }); */
	}, []);

	return (
		<Container fluid className='_app'>
			{/* Routes nest inside one another. Nested route paths build upon
			parent route paths, and nested route elements render inside
			parent route elements. See the note about <Outlet> below. */}
			<Routes>
				<Route path='/' element={<Layout />}>
					<Route index element={<Home />} />
					<Route path='/login' element={<Login />} />
					<Route path='/signup' element={<Signup />} />
					<Route path={`/confirmation/:_tokenID`} element={<Confirmation />} />
					<Route path='/blog' element={<Blog />} />
					<Route path={`/blog/:_postID`} element={<Post />} />
					<Route
						path='/dashboard'
						element={
							<RequireAuth>
								<Dashboard />
							</RequireAuth>
						}
					/>
					<Route path='/process' element={<Process />} />
					<Route path='/aboutus' element={<AboutUs />} />
					<Route path='/feedback' element={<Feedback />} />
					{/* Using path='*'' means 'match anything', so this route
					acts like a catch-all for URLs that we don't have explicit
					routes for. */}
					<Route path='*' element={<NotFound />} />
				</Route>
			</Routes>
		</Container>
	)
}

export default App;