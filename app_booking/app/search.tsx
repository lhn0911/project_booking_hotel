import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HotelCard } from '@/components/booking/hotel-card';
import { BOOKING_COLORS, Hotel } from '@/constants/booking';
import { getAllHotels, searchHotels, HotelResponse } from '@/apis/hotelApi';

export default function SearchScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState<string>('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length > 0) {
        handleSearch(searchText.trim());
      } else {
        loadHotels();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await getAllHotels();
      setHotels(mapHotelResponseToHotel(data));
    } catch (error) {
      console.error('Load hotels error:', error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    try {
      setLoading(true);
      const data = await searchHotels(keyword);
      setHotels(mapHotelResponseToHotel(data));
    } catch (error) {
      console.error('Search hotels error:', error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const mapHotelResponseToHotel = (data: HotelResponse[]): Hotel[] => {
    return data.map((item) => ({
      id: item.hotelId.toString(),
      name: item.hotelName,
      location: `${item.city}, ${item.country}`,
      price: item.pricePerNight || 0,
      rating: 0, // Có thể thêm rating vào Hotel entity sau
      reviewCount: 0, // Có thể thêm reviewCount vào Hotel entity sau
      imageUrl: item.mainImageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : ''),
      isFavorite: false,
    }));
  };

  const toggleFavorite = (hotelId: string): void => {
    setHotels(
      hotels.map((hotel) =>
        hotel.id === hotelId ? { ...hotel, isFavorite: !hotel.isFavorite } : hotel
      )
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khách sạn..."
            placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        )}
        {searchText.length === 0 && (
          <View style={styles.headerButton} />
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >

        {/* Location Option */}
        <TouchableOpacity style={styles.locationOption}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="locate-outline" size={24} color={BOOKING_COLORS.PRIMARY} />
          </View>
          <Text style={styles.locationText}>hoặc sử dụng vị trí hiện tại của tôi</Text>
        </TouchableOpacity>

        {/* Recent Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
          {/* Recent search items would go here */}
        </View>

        {/* Nearby Hotels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchText.trim().length > 0 ? 'Kết quả tìm kiếm' : 'Gần vị trí của bạn'}
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
            </View>
          ) : hotels.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText.trim().length > 0 ? 'Không tìm thấy kết quả' : 'Chưa có khách sạn'}
              </Text>
            </View>
          ) : (
            <View style={styles.hotelsList}>
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  variant="vertical"
                  onPress={() => router.push(`/hotel-detail/${hotel.id}`)}
                  onFavoritePress={() => toggleFavorite(hotel.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
  },
  scrollView: {
    flex: 1,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${BOOKING_COLORS.PRIMARY}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  hotelsList: {
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
});
