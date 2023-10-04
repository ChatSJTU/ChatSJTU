import { fetcher, request } from "./request";
import Config from "../config/config";

export async function jAccountAuth(code, state, basePath, next, params = "") {
    let redirect_uri =
        window.location.origin + basePath + Config.JACCOUNT_LOGIN_RETURI;
    if (next) {
        redirect_uri += "?next=" + next;
    }
    if (params) {
        redirect_uri += next ? "&" : "?";
        redirect_uri += params;
    }
    const resp = await request.post("/oauth/jaccount/auth/", {
        code,
        state,
        redirect_uri,
    });
    return resp;
}

export async function jAccountLogin(basePath, next, params = "") {
    let redirect_uri =
        window.location.origin + basePath + Config.JACCOUNT_LOGIN_RETURI;
    if (next) {
        redirect_uri += "?next=" + next;
    }
    if (params) {
        redirect_uri += next ? "&" : "?";
        redirect_uri += params;
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
        throw error;
    }
};

//获取用户设置
export async function getSettings() {
    try {
        const response = await fetcher('/api/user-preference/');
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// 更新用户设置，这里使用 PATCH 请求来实现局部更新
export async function updateSettings(data) {
    try {
        console.log(data);
        const response = await request.patch('/api/user-preference/', { 
            field: Object.keys(data)[0], 
            value: Object.values(data)[0] });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}