import Axios from 'axios';
import { authProvider } from "auth/auth-provider";
import {
    authRequestInterceptor, authRequestInterceptorOnError,
    authResponseInterceptor, authResponseInterceptorOnError
} from "auth/interceptor";
import { loadingRequestInterceptor } from 'components/Loading/interceptor';
import { loadingRequestInterceptorOnError } from 'components/Loading/interceptor';
import { loadingResponseInterceptor } from 'components/Loading/interceptor';
import { loadingResponseInterceptorOnError } from 'components/Loading/interceptor';

// msal
export const LOGIN_TOKEN_SUCCESS = "AAD_LOGIN_SUCCESS";
export const LOGOUT_SUCCESS = "AAD_LOGOUT_SUCCESS";

// setup
export const SUCCESS_GRAPH_USER_DATA = "SUCCESS_GRAPH_USER_DATA";
export const ERROR_GRAPH_USER_DATA = "ERROR_GRAPH_USER_DATA";

export const SUCCESS_FETCH_ACCOUNT = "SUCCESS_FETCH_ACCOUNT";
export const ERROR_FETCH_ACCOUNT = "ERROR_FETCH_ACCOUNT";

export const SUCCESS_FETCH_COMPANIES = "SUCCESS_FETCH_COMPANIES";
export const ERROR_FETCH_COMPANIES = "ERROR_FETCH_COMPANIES";

export const SUCCESS_ACCOUNT_CREATE = "SUCCESS_ACCOUNT_CREATE";
export const ERROR_ACCOUNT_CREATE = "ERROR_ACCOUNT_CREATE";

// custom axios instance for all redux actions in app
const axios = Axios.create();
axios.defaults.timeout = 2500;

// add auth interceptors (JWT)
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

// add loading interceptors
axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);


export const fetchGraphUserData = () => {
    console.log("FETCH GRAPH ACCOUNT");
    return dispatch => {
        authProvider.getAccessToken()
            .then(token => {
                // Using static Axios to avoid interceptors for graph requests
                Axios.get("https://graph.microsoft.com/v1.0/me", {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token.accessToken
                    }
                })
                    .then(res => res.data)
                    .then(userData => {
                        dispatch({
                            type: SUCCESS_GRAPH_USER_DATA,
                            payload: userData
                        });
                    })
                    .catch(err => {
                        dispatch({
                            type: ERROR_GRAPH_USER_DATA,
                            payload: err
                        });
                    });
            })
            .catch(err => {
                dispatch({
                    type: ERROR_GRAPH_USER_DATA,
                    payload: err
                });
            });
    }
}

export const fetchAccount = (fallback) => {
    console.log("FETCH ACCOUNT");
    return (dispatch, getState) => {
        axios.get("/api/accounts", {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 200) {
                    dispatch({
                        type: SUCCESS_FETCH_ACCOUNT,
                        payload: res.data
                    })
                } else {
                    dispatch({
                        type: ERROR_FETCH_ACCOUNT,
                        payload: res.status
                    })
                    fallback();
                }

            })
            .catch(err => {
                dispatch({
                    type: ERROR_FETCH_ACCOUNT,
                    payload: err
                });
                fallback();
            });
    }
}

export const createAccount = (account) => {
    console.log("CREATE ACCOUNT");
    return (dispatch, getState) => {
        axios.post("/api/accounts", account, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 201) {
                    dispatch({
                        type: SUCCESS_ACCOUNT_CREATE,
                        payload: res.data
                    })
                } else {
                    dispatch({
                        type: ERROR_ACCOUNT_CREATE,
                        payload: res.status
                    })
                }

            })
            .catch(err => {
                dispatch({
                    type: ERROR_ACCOUNT_CREATE,
                    payload: err
                });
            });
    }
}

export const fetchCompanies = (callback) => {
    console.log("FETCH COMPANIES");
    return (dispatch, getState) => {
        if (getState().common.data.companies) {
            dispatch({
                type: SUCCESS_FETCH_COMPANIES,
                payload: getState().common.data.companies
            });
            if (callback) {
                callback(getState().common.data.companies);
            }
            return;
        }
        axios.get("/api/companies", {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 200) {
                    dispatch({
                        type: SUCCESS_FETCH_COMPANIES,
                        payload: res.data
                    });
                    if (callback) {
                        callback(res.data);
                    }
                } else {
                    dispatch({
                        type: ERROR_FETCH_COMPANIES,
                        payload: res.status
                    })
                }
            })
            .catch(err => {
                dispatch({
                    type: ERROR_FETCH_COMPANIES,
                    payload: err
                });
            });
    }
}