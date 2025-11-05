import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthInput } from '@/components/auth/input';
import { AuthButton } from '@/components/auth/button';
import { AUTH_COLORS } from '@/constants/auth';
import { useToast } from '@/hooks/use-toast';

export default function EnterNewPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showSuccess, showError, showWarning, ToastComponent } = useToast();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    if (password.length < 6) {
      showWarning('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowSuccessModal(true);
    }, 1000);
  };

  const handleBackToHome = (): void => {
    setShowSuccessModal(false);
    router.replace('/login');
  };

  const isFormValid = password.length >= 6 && confirmPassword.length >= 6 && password === confirmPassword;

  return (
    <>
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
            <Text style={styles.title}>Enter New Password</Text>
            <Text style={styles.subtitle}>Please enter new password</Text>

            <View style={styles.illustration}>
              <View style={styles.illustrationPlaceholder}>
                <Ionicons name="key-outline" size={80} color={AUTH_COLORS.PRIMARY} />
                <Ionicons
                  name="shield-checkmark-outline"
                  size={40}
                  color={AUTH_COLORS.SUCCESS}
                  style={styles.shieldIcon}
                />
              </View>
            </View>

            <AuthInput
              label="Password"
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <AuthInput
              label="Confirm Password"
              placeholder="Enter Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />


            <AuthButton
              title="Save"
              onPress={handleSave}
              disabled={!isFormValid}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleBackToHome}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIllustration}>
              <View style={styles.successIllustrationPlaceholder}>
                <Ionicons name="checkmark-circle" size={100} color={AUTH_COLORS.SUCCESS} />
                <Ionicons
                  name="phone-portrait-outline"
                  size={60}
                  color={AUTH_COLORS.PRIMARY}
                  style={styles.phoneIcon}
                />
              </View>
            </View>

            <Text style={styles.successTitle}>Password Update Successfully</Text>
            <Text style={styles.successSubtitle}>
              Your password has been updated successfully
            </Text>

            <AuthButton title="Back to Home" onPress={handleBackToHome} />
          </View>
        </View>
      </Modal>
    </>
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
  shieldIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  errorText: {
    fontSize: 12,
    color: AUTH_COLORS.ERROR,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: AUTH_COLORS.BACKGROUND,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  successIllustration: {
    marginBottom: 24,
  },
  successIllustrationPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  phoneIcon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AUTH_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: AUTH_COLORS.TEXT_SECONDARY,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
});
