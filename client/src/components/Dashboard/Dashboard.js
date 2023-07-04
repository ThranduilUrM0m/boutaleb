import React, { useCallback, useEffect } from 'react';
import { _useStore } from '../../store/store';

const Dashboard = (props) => {
    const _user = _useStore((state) => state._user);
    const setUsers = _useStore((state) => state.setUsers);

    const _getUsers = useCallback(
        async () => {
            try {
                /* await api.get_users()
                    .then((res) => {
                        setUsers(res.data._users);
                    })
                    .catch((error) => {
                        console.log(error);
                    }); */
            } catch (error) {
                console.log(error);
            }
        },
        [setUsers]
    );

    useEffect(() => {
        _getUsers();
    }, [_getUsers]);

    return (
        <main className='_dashboard d-flex flex-column justify-content-center align-items-center'>
            <h4>Welcome {_user._user_email}</h4>
        </main>
    );
}

export default Dashboard;