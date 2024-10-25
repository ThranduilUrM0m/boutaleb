// React and Routing
import { Navigate, useLocation } from 'react-router-dom';

// State Management
import _useStore from '../store';

const RequireAuth = ({ children }) => {
    const { user } = _useStore();

    // Access your states and actions like this:
    const _userIsAuthenticated = user._userIsAuthenticated;

    let location = useLocation();

    if (_userIsAuthenticated) {
        return children;
    } else {
        return <Navigate to='/login' replace={true} state={{ from: location }} />;
    }
};

export default RequireAuth;
