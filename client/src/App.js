import React from "react";
import { Route, Routes } from "react-router-dom";
import Container from "react-bootstrap/Container";

// Components
import Layout from "./components/Layout/Layout";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Confirmation from "./components/Confirmation/Confirmation";
import Blog from "./components/Blog/Blog";
import Post from "./components/Post/Post";
import Dashboard from "./components/Dashboard/Dashboard";
import Process from "./components/Process/Process";
import AboutUs from "./components/AboutUs/AboutUs";
import Feedback from "./components/Feedback/Feedback";
import NotFound from "./components/NotFound/NotFound";
import RequireAuth from "./components/RequireAuth";

const App = () => {
	return (
		<Container fluid className="_app">
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/confirmation/:_tokenID" element={<Confirmation />} />
					<Route path="/blog" element={<Blog />} />
					<Route path="/blog/:_postID" element={<Post />} />

					<Route
						path="/dashboard"
						element={
							<RequireAuth>
								<Dashboard />
							</RequireAuth>
						}
					/>

					<Route path="/process" element={<Process />} />
					<Route path="/aboutus" element={<AboutUs />} />
					<Route path="/feedback" element={<Feedback />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</Container>
	);
};

export default App;