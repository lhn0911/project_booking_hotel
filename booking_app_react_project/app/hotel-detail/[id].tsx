import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { BOOKING_COLORS } from '@/constants/booking';
import { getHotelById, HotelResponse } from '@/apis/hotelApi';

export default function HotelDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHotelDetail();
  }, [id]);

  const loadHotelDetail = async () => {
    try {
      setLoading(true);
      const hotelId = parseInt(id || '0', 10);
      if (isNaN(hotelId)) {
        Alert.alert('Lỗi', 'ID khách sạn không hợp lệ');
        router.back();
        return;
      }
      const data = await getHotelById(hotelId);
      setHotel(data);
    } catch (error) {
      console.error('Load hotel detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin khách sạn', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !hotel) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
        <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải thông tin khách sạn...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerButton, styles.headerButtonTransparent]}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={[styles.headerButton, styles.headerButtonTransparent]}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? BOOKING_COLORS.HEART : BOOKING_COLORS.BACKGROUND}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, styles.headerButtonTransparent]}>
            <Ionicons name="share-outline" size={24} color={BOOKING_COLORS.BACKGROUND} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Main Image */}
        <View style={[styles.imageContainer, { width }]}>
          <ExpoImage
            source={{ uri: hotel.mainImageUrl || (hotel.imageUrls && hotel.imageUrls.length > 0 ? hotel.imageUrls[0] : '') }}
            style={styles.mainImage}
            contentFit="cover"
            transition={200}
          />
        </View>

        {/* Hotel Info */}
        <View style={styles.content}>
          <Text style={styles.hotelName}>{hotel.hotelName}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.location}>
              {hotel.address || `${hotel.city}, ${hotel.country}`}
            </Text>
          </View>

          {/* Overview */}
          {hotel.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.overviewText}>{hotel.description}</Text>
            </View>
          )}

          {/* Photos */}
          {hotel.imageUrls && hotel.imageUrls.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hình ảnh</Text>
                {hotel.imageUrls.length > 3 && (
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                data={hotel.imageUrls}
                renderItem={({ item }) => (
                  <View style={styles.photoThumbnail}>
                    <ExpoImage
                      source={{ uri: item }}
                      style={styles.photoImage}
                      contentFit="cover"
                    />
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
              />
            </View>
          )}

          {/* Owner Info */}
          {hotel.ownerName && (
            <View style={styles.section}>
              <Text style={styles.roomTitle}>Chủ khách sạn</Text>
              <Text style={styles.roomDetails}>{hotel.ownerName}</Text>
            </View>
          )}

          {/* Address Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="location-outline" size={24} color={BOOKING_COLORS.PRIMARY} />
              </View>
              <Text style={styles.featureText}>
                {hotel.address || 'Không có địa chỉ'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="map-outline" size={24} color={BOOKING_COLORS.PRIMARY} />
              </View>
              <Text style={styles.featureText}>
                {hotel.city}, {hotel.country}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.priceContainer}>
          {hotel.pricePerNight && hotel.pricePerNight > 0 ? (
            <>
              <Text style={styles.priceLabel}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hotel.pricePerNight)}
              </Text>
              <Text style={styles.priceSubLabel}>/đêm</Text>
            </>
          ) : (
            <Text style={styles.priceLabel}>Liên hệ để biết giá</Text>
          )}
        </View>
        <TouchableOpacity style={styles.selectDateButton}>
          <Text style={styles.selectDateText}>Đặt phòng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonTransparent: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  reviews: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    lineHeight: 24,
  },
  photosList: {
    gap: 12,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  roomDetails: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${BOOKING_COLORS.PRIMARY}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    lineHeight: 24,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.PRICE,
  },
  priceSubLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  selectDateButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  selectDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});
