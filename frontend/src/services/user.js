import axios from 'axios';
import Config from "../config/config";

export const authInstance = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000, 
});

export async function jAccountAuth(code, state, basePath, next) {
    let redirect_uri =
        window.location.origin + basePath + Config.JACCOUNT_LOGIN_RETURI;
    if (next) {
        redirect_uri += "?next=" + next;
    }
    const resp = await authInstance.post("/oauth/jaccount/auth/", {
        params: {
        code,
        state,
        redirect_uri,
        },
    });
    return resp.data;
}

export async function jAccountLogin(basePath, next) {
    let redirect_uri =
        window.location.origin + basePath + Config.JACCOUNT_LOGIN_RETURI;
    if (next) {
        redirect_uri += "?next=" + next;
    }
    window.location.href = `/oauth/jaccount/login/?redirect_uri=${redirect_uri}`;
}
