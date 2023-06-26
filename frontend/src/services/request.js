import axios from "axios";

export const request = axios.create({
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
    withCredentials: true,
});

export const fetcher = (url) =>
    request.get(url).then((res) => res.data);