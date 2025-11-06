import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { BOOKING_COLORS } from '@/constants/booking';
import { getUpcomingBookings, getPastBookings, cancelBooking, BookingResponse } from '@/apis/bookingApi';
import { useRouter } from 'expo-router';

type TabType = 'upcoming' | 'past';

export default function BookingsScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const { data: upcomingBookings, isLoading: loadingUpcoming, refetch: refetchUpcoming } = useQuery({
    queryKey: ['upcomingBookings'],
    queryFn: getUpcomingBookings,
    enabled: activeTab === 'upcoming',
  });

  const { data: pastBookings, isLoading: loadingPast, refetch: refetchPast } = useQuery({
    queryKey: ['pastBookings'],
    queryFn: getPastBookings,
    enabled: activeTab === 'past',
  });

  const handleCancelBooking = async (bookingId: number) => {
    Alert.alert(
      'Hủy đặt phòng',
      'Bạn có chắc chắn muốn hủy đặt phòng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt phòng',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              refetchUpcoming();
              Alert.alert('Thành công', 'Đã hủy đặt phòng thành công');
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Không thể hủy đặt phòng');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (booking: BookingResponse) => {
    router.push({
      pathname: '/booking/booking-detail',
      params: { bookingId: booking.bookingId.toString() },
    });
  };

  const handleWriteReview = (booking: BookingResponse) => {
    router.push({
      pathname: '/booking/write-review',
      params: {
        roomId: booking.roomId.toString(),
        hotelName: booking.hotelName || '',
      },
    });
  };

  const handleBookAgain = (booking: BookingResponse) => {
    router.push({
      pathname: '/room-detail/[id]',
      params: { id: booking.roomId.toString() },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderBookingCard = (booking: BookingResponse) => {
    const isUpcoming = activeTab === 'upcoming';
    
    return (
      <View key={booking.bookingId} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingId}>Booking ID: {booking.bookingId}</Text>
          <Text style={styles.bookingDate}>
            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
          </Text>
        </View>

        <View style={styles.bookingContent}>
          <ExpoImage
            source={{
              uri: booking.roomImageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
            }}
            style={styles.roomImage}
            contentFit="cover"
          />
          <View style={styles.bookingInfo}>
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(booking.rating || 0) ? 'star' : 'star-outline'}
                  size={14}
                  color={BOOKING_COLORS.RATING}
                />
              ))}
              <Text style={styles.ratingText}>
                {booking.rating?.toFixed(1) || '0.0'} ({booking.reviewCount || 0} Reviews)
              </Text>
            </View>
            <Text style={styles.hotelName}>{booking.hotelName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
              <Text style={styles.location}>{booking.hotelLocation || booking.hotelCity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bookingActions}>
          {isUpcoming ? (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(booking.bookingId)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewDetails(booking)}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleWriteReview(booking)}>
                <Text style={styles.cancelButtonText}>Write a Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleBookAgain(booking)}>
                <Text style={styles.viewButtonText}>Book Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderBookings = () => {
    const isLoading = activeTab === 'upcoming' ? loadingUpcoming : loadingPast;
    const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    if (!bookings || bookings.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="calendar-outline" size={64} color={BOOKING_COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' ? 'Chưa có đặt phòng sắp tới' : 'Chưa có đặt phòng đã qua'}
          </Text>
        </View>
      );
    }

    return <View style={styles.bookingsList}>{bookings.map(renderBookingCard)}</View>;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}>
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {renderBookings()}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
  },
  activeTab: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  activeTabText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  bookingContent: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  roomImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
