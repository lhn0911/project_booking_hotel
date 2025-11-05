import { CityButton } from '@/components/booking/city-button';
import { HotelCard } from '@/components/booking/hotel-card';
import { SearchBar } from '@/components/booking/search-bar';
import { BOOKING_COLORS, Hotel, City } from '@/constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllHotels, HotelResponse } from '@/apis/hotelApi';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bestHotels, setBestHotels] = useState<Hotel[]>([]);
  const [nearbyHotels, setNearbyHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await getAllHotels();
      const mappedHotels = mapHotelResponseToHotel(data);
      
      // Lấy 2 hotel đầu tiên làm best hotels
      setBestHotels(mappedHotels.slice(0, 2));
      // Lấy các hotel còn lại làm nearby hotels
      setNearbyHotels(mappedHotels.slice(2));
      
      // Tạo cities từ hotels data
      const citySet = new Set<string>();
      data.forEach((hotel) => {
        if (hotel.city) {
          citySet.add(hotel.city);
        }
      });
      const citiesList: City[] = Array.from(citySet)
        .slice(0, 5) // Lấy tối đa 5 cities
        .map((city, index) => ({
          id: (index + 1).toString(),
          name: city,
          imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=200',
        }));
      setCities(citiesList);
    } catch (error) {
      console.error('Load hotels error:', error);
      setBestHotels([]);
      setNearbyHotels([]);
      setCities([]);
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
      rating: 0,
      reviewCount: 0,
      imageUrl: item.mainImageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : ''),
      isFavorite: false,
    }));
  };

  const toggleFavorite = (hotelId: string, list: Hotel[], setList: (hotels: Hotel[]) => void): void => {
    setList(
      list.map((hotel) =>
        hotel.id === hotelId ? { ...hotel, isFavorite: !hotel.isFavorite } : hotel
      )
    );
  };

  const renderSectionHeader = (title: string, onSeeAll?: () => void): React.JSX.Element => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BOOKING_COLORS.PRIMARY} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="grid-outline" size={22} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>live Green</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => router.push('/(tabs)/account')}
        >
          <Ionicons name="person-outline" size={22} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Search Bar */}
        <SearchBar onPress={() => router.push('/search')} />

        {/* City Categories */}
        {cities.length > 0 && (
          <View style={styles.citiesSection}>
            <FlatList
              data={cities}
              renderItem={({ item }) => (
                <CityButton city={item} onPress={() => router.push('/filter')} />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesList}
            />
          </View>
        )}

        {/* Best Hotels */}
        {renderSectionHeader('Khách sạn nổi bật', () => router.push('/filter'))}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={bestHotels}
            renderItem={({ item }) => (
              <HotelCard
                hotel={item}
                variant="horizontal"
                onPress={() => router.push(`/hotel-detail/${item.id}`)}
                onFavoritePress={() => toggleFavorite(item.id, bestHotels, setBestHotels)}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotelsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có khách sạn nổi bật</Text>
              </View>
            }
          />
        )}

        {/* Nearby Hotels */}
        {renderSectionHeader('Gần vị trí của bạn', () => router.push('/filter'))}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          </View>
        ) : (
          <View style={styles.nearbyHotels}>
            {nearbyHotels.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có khách sạn gần đây</Text>
              </View>
            ) : (
              nearbyHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  variant="vertical"
                  onPress={() => router.push(`/hotel-detail/${hotel.id}`)}
                  onFavoritePress={() => toggleFavorite(hotel.id, nearbyHotels, setNearbyHotels)}
                />
              ))
            )}
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BOOKING_COLORS.BACKGROUND,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  citiesSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  citiesList: {
    paddingHorizontal: 20,
    paddingRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  hotelsList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  nearbyHotels: {
    paddingHorizontal: 20,
    paddingBottom: 32,
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