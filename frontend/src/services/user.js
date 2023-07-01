import { fetcher, request } from "./request";
import Config from "../config/config";

export async function jAccountAuth(code, state, basePath, next) {
    let redirect_uri =
        window.location.origin + basePath + Config.JACCOUNT_LOGIN_RETURI;
    if (next) {
        redirect_uri += "?next=" + next;
    }
    console.log(code, state, redirect_uri);
    const resp = await request.post("/oauth/jaccount/auth/", {
        code,
        state,
        redirect_uri,
        });
    return resp;
}

export async function jAccountLogin(basePath, next) {
    let redirect_uri =
        window.location.origin + basePath + Config.JACCOUNT_LOGIN_RETURI;
    if (next) {
        redirect_uri += "?next=" + next;
    }
    // window.location.href = `/oauth/jaccount/login/?redirect_uri=${redirect_uri}`;
    window.location.href = `http://localhost:8000/oauth/jaccount/login/?redirect_uri=${redirect_uri}`;
}

//获取用户信息
export async function fetchUserProfile() {
    try {
        const response = await request.get('/oauth/profile/'); 
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error
    }
};