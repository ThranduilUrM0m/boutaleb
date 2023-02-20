import axios from 'axios';
const headers = {
    'Content-Type': 'application/json'
};
const burl = '';

const api = {
    login: async (send) => {
        return axios.post(
            `${burl}/user/login`,
            send,
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
    _sendMessage: async (send) => {
        return axios.post(
            `${burl}/user/sendMessage`, 
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
    },
    logout: async (_user) => {
        return axios.post(
            `${burl}/user/logout`,
            {
                _user,
            },
            {
                headers: headers
            }
        );
    }
};

export default api;