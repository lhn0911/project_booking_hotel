import { AuthButton } from '@/components/auth/button';
import { AuthInput } from '@/components/auth/input';
import { AUTH_COLORS } from '@/constants/auth';
import { sendRequestCode } from '@/apis/authApi';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { sanitizeErrorMessage } from '@/utils/errorHandler';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContactOption {
  id: string;
  type: 'sms' | 'email';
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function ForgotPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showError, showWarning, showSuccess, ToastComponent } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>('1');
  const [email, setEmail] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false);

  useEffect(() => {
    const getStoredData = async () => {
      try {
        // Try to get email first
        const storedEmail = await AsyncStorage.getItem('email');
        if (storedEmail) {
          setEmail(storedEmail);
          setInputEmail(storedEmail);
        } else {
          // If no email, try username
          const storedUsername = await AsyncStorage.getItem('username');
          if (storedUsername) {
            // Check if username is an email
            if (storedUsername.includes('@')) {
              setEmail(storedUsername);
              setInputEmail(storedUsername);
            } else {
              // Show input field if username is not an email
              setShowEmailInput(true);
            }
          } else {
            // No data stored, show input field
            setShowEmailInput(true);
          }
        }
      } catch (error) {
        if (__DEV__) console.error('Error retrieving data from storage:', error);
        setShowEmailInput(true);
      }
    };
    getStoredData();
  }, []);

  // Mutation để gửi OTP
  const sendOTPMutation = useMutation({
    mutationFn: (emailToSend: string) => sendRequestCode(emailToSend),
    onSuccess: () => {
      showSuccess('OTP đã được gửi thành công!');
      // Lưu phương thức đã chọn để dùng cho resend
      AsyncStorage.setItem('otpMethod', selectedOption).catch(() => {});
      setTimeout(() => {
        router.push('/enter-otp');
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = sanitizeErrorMessage(error);
      showError(errorMessage);
    },
  });

  const handleContinue = (): void => {
    // Validate email if SMS is not selected or email input is shown
    if (selectedOption === '2' || showEmailInput) {
      const emailToUse = showEmailInput ? inputEmail : email;
      if (!emailToUse || !emailToUse.includes('@')) {
        showWarning('Vui lòng nhập email hợp lệ');
        return;
      }
      // Save email for future use
      const trimmedEmail = emailToUse.trim();
      AsyncStorage.setItem('email', trimmedEmail).catch(() => {});
      // Gửi OTP qua email
      sendOTPMutation.mutate(trimmedEmail);
    } else {
      // SMS - cần số điện thoại (hiện tại đang hardcode)
      // TODO: Cần lấy số điện thoại từ user hoặc từ profile
      showWarning('Tính năng gửi OTP qua SMS đang được phát triển');
    }
  };

  // 📱 Danh sách lựa chọn (số điện thoại cố định, email thật)
  const CONTACT_OPTIONS: ContactOption[] = [
    {
      id: '1',
      type: 'sms',
      label: 'Send OTP via SMS',
      value: '0325672239',
      icon: 'call-outline',
    },
    {
      id: '2',
      type: 'email',
      label: 'Send OTP via Email',
      value: showEmailInput ? (inputEmail || 'Nhập email của bạn') : (email || 'Loading...'),
      icon: 'mail-outline',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={AUTH_COLORS.BACKGROUND} />
      {ToastComponent}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AUTH_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Select which contact details should we use to reset your password
          </Text>

          <View style={styles.illustration}>
            <View style={styles.illustrationPlaceholder}>
              <Ionicons name="phone-portrait-outline" size={80} color={AUTH_COLORS.PRIMARY} />
              <Ionicons
                name="help-circle-outline"
                size={40}
                color={AUTH_COLORS.TEXT_SECONDARY}
                style={styles.questionMark}
              />
            </View>
          </View>

          <View style={styles.optionsContainer}>
            {CONTACT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedOption === option.id && styles.optionCardSelected,
                ]}
                onPress={() => {
                  setSelectedOption(option.id);
                  if (option.id === '2' && !email) {
                    setShowEmailInput(true);
                  }
                }}>
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionIconContainer,
                      selectedOption === option.id && styles.optionIconContainerSelected,
                    ]}>
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={
                        selectedOption === option.id
                          ? AUTH_COLORS.PRIMARY
                          : AUTH_COLORS.TEXT_SECONDARY
                      }
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedOption === option.id && styles.optionLabelSelected,
                      ]}>
                      {option.label}
                    </Text>
                    {selectedOption === option.id && option.id === '2' && showEmailInput ? (
                      <View style={styles.emailInputWrapper}>
                        <AuthInput
                          placeholder="Nhập email của bạn"
                          value={inputEmail}
                          onChangeText={setInputEmail}
                          keyboardType="email-address"
                          leftIcon="mail-outline"
                        />
                      </View>
                    ) : (
                      <Text style={styles.optionValue}>{option.value}</Text>
                    )}
                  </View>
                </View>
                {selectedOption === option.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color={AUTH_COLORS.PRIMARY} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <AuthButton
            title="Continue"
            onPress={handleContinue}
            loading={sendOTPMutation.isPending}
            disabled={sendOTPMutation.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AUTH_COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AUTH_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: AUTH_COLORS.TEXT_SECONDARY,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: 40,
    minHeight: 200,
  },
  illustrationPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  questionMark: {
    position: 'absolute',
    top: -20,
    right: -20,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: AUTH_COLORS.INPUT_BACKGROUND,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: AUTH_COLORS.INPUT_BORDER,
  },
  optionCardSelected: {
    borderColor: AUTH_COLORS.PRIMARY,
    backgroundColor: `${AUTH_COLORS.PRIMARY}10`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AUTH_COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconContainerSelected: {
    backgroundColor: AUTH_COLORS.PRIMARY,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AUTH_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: AUTH_COLORS.PRIMARY,
  },
  optionValue: {
    fontSize: 14,
    color: AUTH_COLORS.TEXT_SECONDARY,
  },
  checkmark: {
    marginLeft: 12,
  },
  emailInputWrapper: {
    marginTop: 8,
    width: '100%',
  },
});
