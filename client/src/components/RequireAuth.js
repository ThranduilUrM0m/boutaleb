import { _useStore } from '../store/store';
import {
    Navigate,
    useLocation
} from 'react-router-dom';
import _ from 'lodash';

const RequireAuth = ({ children }) => {
	const _userIsAuthenticated = _useStore((state) => state._userIsAuthenticated);
    let location = useLocation();

    if (_userIsAuthenticated) {
        return children;
    } else {
        return <Navigate to="/login" replace={true} state={{ from: location }} />;
    }
}

export default RequireAuth;