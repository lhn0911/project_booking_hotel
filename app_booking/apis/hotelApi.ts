import axiosInstance from "@/utils/axiosInstance";

export interface HotelResponse {
    hotelId: number;
    hotelName: string;
    address: string;
    city: string;
    country: string;
    description: string;
    pricePerNight: number | null;
    mainImageUrl: string | null;
    imageUrls: string[];
    ownerName: string | null;
}

// Lấy tất cả khách sạn
export const getAllHotels = async (): Promise<HotelResponse[]> => {
    try {
        const response = await axiosInstance.get("hotels");
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        return response.data?.data || [];
    } catch (error: any) {
        console.error("Get all hotels error:", error);
        throw error;
    }
};

// Tìm kiếm khách sạn
export const searchHotels = async (keyword?: string, city?: string): Promise<HotelResponse[]> => {
    try {
        const params: any = {};
        if (keyword) params.keyword = keyword;
        if (city) params.city = city;
        
        const response = await axiosInstance.get("hotels/search", { params });
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        return response.data?.data || [];
    } catch (error: any) {
        console.error("Search hotels error:", error);
        throw error;
    }
};

// Lấy chi tiết khách sạn
export const getHotelById = async (hotelId: number): Promise<HotelResponse> => {
    try {
        const response = await axiosInstance.get(`hotels/${hotelId}`);
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        return response.data?.data;
    } catch (error: any) {
        console.error("Get hotel by id error:", error);
        throw error;
    }
};

