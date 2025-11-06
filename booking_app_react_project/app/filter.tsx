import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HotelCard } from '@/components/booking/hotel-card';
import { BOOKING_COLORS, Hotel } from '@/constants/booking';
import { getAllHotels, searchHotels, HotelResponse } from '@/apis/hotelApi';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onApply?: () => void;
  onClearAll?: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  title,
  children,
  onApply,
  onClearAll,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>{children}</ScrollView>
          {(onApply || onClearAll) && (
            <View style={styles.modalFooter}>
              {onClearAll && (
                <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
              {onApply && (
                <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function FilterScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [allHotels, setAllHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
  const [localityModalVisible, setLocalityModalVisible] = useState<boolean>(false);
  const [priceModalVisible, setPriceModalVisible] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('popularity');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await getAllHotels();
      setAllHotels(data);
      // Apply filters after loading
      setTimeout(() => {
        applyFilters();
      }, 100);
    } catch (error) {
      console.error('Load hotels error:', error);
      setHotels([]);
      setAllHotels([]);
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

  // Lấy danh sách cities từ hotels
  const getCityOptions = (): string[] => {
    const cities = new Set<string>();
    allHotels.forEach((hotel) => {
      if (hotel.city) {
        cities.add(hotel.city);
      }
    });
    return Array.from(cities).sort();
  };

  const applyFilters = () => {
    let filteredHotels = [...allHotels];

    // Filter theo locality (city) - đã được filter ở handleLocalityFilter
    // Không cần filter lại ở đây vì allHotels đã được filter rồi

    // Sort
    let sortedHotels = [...filteredHotels];
    switch (selectedSort) {
      case 'popularity':
        // Giữ nguyên thứ tự
        break;
      case 'nearby':
        // Có thể sort theo location nếu có coordinates
        break;
      case 'rating':
        // Sort theo rating nếu có trong database
        break;
      case 'price-low':
        // Sort theo price tăng dần
        break;
      case 'price-high':
        // Sort theo price giảm dần
        break;
      default:
        break;
    }

    const mappedHotels = mapHotelResponseToHotel(sortedHotels);
    setHotels(mappedHotels);
  };

  const handleLocalityFilter = async (localities: string[]) => {
    if (localities.length === 0) {
      await loadHotels();
    } else {
      try {
        setLoading(true);
        const allFilteredHotels: HotelResponse[] = [];
        for (const city of localities) {
          // Gọi API với city name chính xác từ database
          const data = await searchHotels(undefined, city);
          // Filter chính xác theo city để đảm bảo chỉ lấy hotels có city khớp
          // Normalize cả hai để so sánh (trim và normalize whitespace)
          const normalizedCity = city.trim().replace(/\s+/g, ' ');
          const exactCityHotels = data.filter((hotel) => {
            if (!hotel.city) return false;
            const normalizedHotelCity = hotel.city.trim().replace(/\s+/g, ' ');
            return normalizedHotelCity === normalizedCity;
          });
          allFilteredHotels.push(...exactCityHotels);
        }
        // Remove duplicates
        const uniqueHotels = allFilteredHotels.filter(
          (hotel, index, self) => index === self.findIndex((h) => h.hotelId === hotel.hotelId)
        );
        setAllHotels(uniqueHotels);
        // Apply sort sau khi filter
        setTimeout(() => {
          applyFilters();
        }, 100);
      } catch (error) {
        console.error('Filter by locality error:', error);
        // Nếu có lỗi, reload lại tất cả hotels
        await loadHotels();
      } finally {
        setLoading(false);
      }
    }
  };

  const sortOptions = [
    { id: 'popularity', label: 'Độ phổ biến', icon: 'grid-outline' },
    { id: 'nearby', label: 'Gần vị trí', icon: 'location-outline' },
    { id: 'rating', label: 'Đánh giá', icon: 'star-outline' },
    { id: 'price-low', label: 'Giá: thấp đến cao', icon: 'arrow-up-outline' },
    { id: 'price-high', label: 'Giá: cao đến thấp', icon: 'arrow-down-outline' },
  ];

  const localityOptions = getCityOptions();

  const priceRanges = ['Liên hệ', 'Tùy chọn', 'Theo thỏa thuận'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm khách sạn</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setSortModalVisible(true)}>
          <Ionicons name="swap-vertical-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
          <Text style={styles.filterButtonText}>Sắp xếp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setLocalityModalVisible(true)}>
          <Text style={styles.filterButtonText}>Thành phố</Text>
          <Ionicons name="chevron-down-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setPriceModalVisible(true)}>
          <Text style={styles.filterButtonText}>Giá</Text>
          <Ionicons name="chevron-down-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Hotel List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : hotels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy khách sạn</Text>
          </View>
        ) : (
          <View style={styles.hotelsList}>
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                variant="vertical"
                onPress={() => router.push(`/hotel-detail/${hotel.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sort Modal */}
      <FilterModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        title="Sắp xếp theo">
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionItem}
            onPress={() => {
              setSelectedSort(option.id);
              setSortModalVisible(false);
              // Apply sort after a short delay to ensure state is updated
              setTimeout(() => {
                applyFilters();
              }, 100);
            }}>
            <Ionicons
              name={option.icon as any}
              size={20}
              color={selectedSort === option.id ? BOOKING_COLORS.PRIMARY : BOOKING_COLORS.TEXT_SECONDARY}
            />
            <Text
              style={[
                styles.optionText,
                selectedSort === option.id && styles.optionTextSelected,
              ]}>
              {option.label}
            </Text>
            {selectedSort === option.id && (
              <Ionicons name="checkmark" size={20} color={BOOKING_COLORS.PRIMARY} />
            )}
          </TouchableOpacity>
        ))}
      </FilterModal>

      {/* Locality Modal */}
      <FilterModal
        visible={localityModalVisible}
        onClose={() => setLocalityModalVisible(false)}
        title="Thành phố"
        onApply={() => {
          setLocalityModalVisible(false);
          handleLocalityFilter(selectedLocalities);
        }}
        onClearAll={() => {
          setSelectedLocalities([]);
          setLocalityModalVisible(false);
          handleLocalityFilter([]);
        }}>
        {localityOptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có thành phố nào</Text>
          </View>
        ) : (
          localityOptions.map((locality) => {
            const isSelected = selectedLocalities.includes(locality);
            return (
              <TouchableOpacity
                key={locality}
                style={styles.checkboxItem}
                onPress={() => {
                  if (isSelected) {
                    const newLocalities = selectedLocalities.filter((l) => l !== locality);
                    setSelectedLocalities(newLocalities);
                  } else {
                    setSelectedLocalities([...selectedLocalities, locality]);
                  }
                }}>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={BOOKING_COLORS.BACKGROUND} />}
                </View>
                <Text style={[styles.checkboxText, isSelected && styles.checkboxTextSelected]}>
                  {locality}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </FilterModal>

      {/* Price Modal */}
      <FilterModal
        visible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        title="Giá"
        onApply={() => {
          setPriceModalVisible(false);
          applyFilters();
        }}
        onClearAll={() => {
          setSelectedPriceRange('');
          applyFilters();
        }}>
        {priceRanges.map((range) => {
          const isSelected = selectedPriceRange === range;
          return (
            <TouchableOpacity
              key={range}
              style={styles.radioItem}
              onPress={() => setSelectedPriceRange(range)}>
              <View style={styles.radioButton}>
                {isSelected && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>
                {range}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={styles.priceRangeSection}>
          <Text style={styles.priceRangeTitle}>Khoảng giá</Text>
          <View style={styles.priceRangeContainer}>
            <Text style={styles.priceRangeValue}>Liên hệ để biết giá</Text>
            <View style={styles.priceSliderPlaceholder}>
              <Text style={styles.priceSliderText}>Giá sẽ được cập nhật sau</Text>
            </View>
          </View>
        </View>
      </FilterModal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  hotelsList: {
    padding: 16,
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderColor: BOOKING_COLORS.PRIMARY,
  },
  checkboxText: {
    flex: 1,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  checkboxTextSelected: {
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  showMore: {
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  radioText: {
    flex: 1,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  radioTextSelected: {
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  priceRangeSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  priceRangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  priceRangeContainer: {
    gap: 12,
  },
  priceRangeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRIMARY,
  },
  priceSliderPlaceholder: {
    height: 60,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  priceSliderText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
});
