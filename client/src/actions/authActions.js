import { GET_ERRORS } from './types';
import axios from 'axios';
//register user
export const registerUser = (userData, history) => dispatch => {
    // return {
    //     type: TEST_DISPATCH,
    //     payload: userData
    // };



    axios.post('api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
    })
);
};