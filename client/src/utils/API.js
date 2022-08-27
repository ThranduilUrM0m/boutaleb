import axios from 'axios';
const headers = {
    'Content-Type': 'application/json'
};
const burl = '';

const api = {
    login: async (_userEmailValue, _userPasswordValue) => {
        return axios.post(
            `${burl}/user/login`,
            {
                _userEmailValue,
                _userPasswordValue
            },
            {
                headers: headers
            }
        );
    },
    signup: async (send) => {
        return axios.post(
            `${burl}/user/signup`, 
            send, 
            { 
                headers: headers
            }
        );
    },
    confirmation: async (send) => {
        return axios.post(
            `${burl}/user/confirmation`, 
            send, 
            { 
                headers: headers 
            }
        );
    },
    update: async (send) => {
        return axios.patch(`${burl}/user/update`, send, { headers: headers });
    },
    get_user: async (email) => {
        return axios.post(
            `${burl}/user/get_user`,
            {
                email
            },
            {
                headers: headers
            }
        );
    },
    get_users: async () => {
        return axios.post(
            `${burl}/user/get_users`,
            {
                headers: headers
            }
        );
    }
};

export default api;