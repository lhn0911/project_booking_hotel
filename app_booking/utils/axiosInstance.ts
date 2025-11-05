import apiConfig from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const axiosInstance = axios.create({
    baseURL: apiConfig.API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        } catch { }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest: any = error?.config || {};
        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem("refreshToken");
                if (!refreshToken) throw error;
                const res = await axios.post(
                    `${apiConfig.API_BASE_URL}auth/refresh`,
                    { refreshToken }
                );
                const newToken = res?.data?.token;
                if (newToken) {
                    await AsyncStorage.setItem("accessToken", newToken);
                    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch {
                await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userProfile"]);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
