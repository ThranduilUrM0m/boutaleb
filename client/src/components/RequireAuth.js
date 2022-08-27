import { _useStore } from '../store/store';
import {
    Navigate,
    useLocation
} from 'react-router-dom';
import _ from 'lodash';

const RequireAuth = ({ children }) => {
    let location = useLocation();

	const _user = _useStore((state) => state._user);

    if (!_.isEmpty(_user)) {
        return children;
    } else {
        return <Navigate to="/login" replace={true} state={{ from: location }} />;
    }
}

export default RequireAuth;