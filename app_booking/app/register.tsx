import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Input from "../components/Input";
import axiosInstance from "../utils/axiosInstance";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: new Date(),
    gender: "Male" as "Male" | "Female",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string | Date) => {
    setForm({ ...form, [key]: value });
  };

  const formatDate = (date: Date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length > 0 && cleaned[0] !== "0") {
      return "0" + cleaned.slice(0, 9);
    }
    const limited = cleaned.slice(0, 10);
    if (limited.length <= 3) return `(${limited}`;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleChange("phoneNumber", formatted);
  };

  const onRegister = async () => {
    const { fullName, email, phoneNumber, dateOfBirth, gender } = form;

    if (!fullName || !email || !phoneNumber) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!/^0\d{9}$/.test(phoneNumberClean)) {
      Alert.alert("Lỗi", "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số");
      return;
    }

    const year = dateOfBirth.getFullYear();
    const month = String(dateOfBirth.getMonth() + 1).padStart(2, "0");
    const day = String(dateOfBirth.getDate()).padStart(2, "0");
    const dateOfBirthFormatted = `${year}-${month}-${day}`;

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/register", {
        fullName,
        email,
        phoneNumber: phoneNumberClean,
        dateOfBirth: dateOfBirthFormatted,
        gender,
      });

      if (res.status === 200 || res.status === 201) {
        // Check if response has success field
        if (res.data?.success || res.data?.data) {
          Alert.alert("Thành công", res.data?.message || "Đăng ký thành công. Vui lòng kiểm tra mã OTP.");
          // Navigate to verify OTP screen
          router.push({
            pathname: "/verify-otp",
            params: {
              phoneNumber: phoneNumberClean,
            },
          });
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Không thể đăng ký");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Không thể đăng ký");
      }
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.response?.data?.errors || "Đã xảy ra lỗi khi đăng ký";
      Alert.alert("Đăng ký thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.fullName.length > 0 &&
    form.email.length > 0 &&
    form.phoneNumber.replace(/\D/g, "").length === 10;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LG</Text>
          </View>
          <Text style={styles.logoTitle}>live Green</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Register Now!</Text>
          <Text style={styles.subtitle}>Enter your information below</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter Full Name"
            value={form.fullName}
            onChangeText={(text: any) => handleChange("fullName", text)}
          />
          <Input
            label="Email Address"
            placeholder="Enter Email"
            value={form.email}
            onChangeText={(text: any) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Mobile Number"
            placeholder="Enter Mobile Number"
            value={form.phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
          />
          <Input
            label="Date of Birth"
            placeholder="Select Date of Birth"
            value={formatDate(form.dateOfBirth)}
            onChangeText={() => { }}
            editable={false}
            onPress={() => setShowDatePicker(true)}
            rightIcon="calendar-outline"
            onRightIconPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={form.dateOfBirth}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  handleChange("dateOfBirth", selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  form.gender === "Male" && styles.genderOptionSelected,
                ]}
                onPress={() => handleChange("gender", "Male")}
              >
                <View
                  style={[
                    styles.radioButton,
                    form.gender === "Male" && styles.radioButtonSelected,
                  ]}
                >
                  {form.gender === "Male" && <View style={styles.radioButtonInner} />}
                </View>
                <Text
                  style={[
                    styles.genderText,
                    form.gender === "Male" && styles.genderTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  form.gender === "Female" && styles.genderOptionSelected,
                ]}
                onPress={() => handleChange("gender", "Female")}
              >
                <View
                  style={[
                    styles.radioButton,
                    form.gender === "Female" && styles.radioButtonSelected,
                  ]}
                >
                  {form.gender === "Female" && <View style={styles.radioButtonInner} />}
                </View>
                <Text
                  style={[
                    styles.genderText,
                    form.gender === "Female" && styles.genderTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Register"
            onPress={onRegister}
            variant="primary"
            isLoading={loading}
            disabled={!isFormValid}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already a member? </Text>
          <Text style={styles.loginLink} onPress={() => router.replace("/login")}>
            Login
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3182CE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  logoTitle: { fontSize: 20, fontWeight: "600", color: "#3182CE" },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", color: "#3182CE", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#718096" },
  form: { marginBottom: 24 },
  genderContainer: { marginBottom: 24 },
  genderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 12,
  },
  genderOptions: { flexDirection: "row", gap: 16 },
  genderOption: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  genderOptionSelected: {},
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioButtonSelected: { borderColor: "#3182CE" },
  radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3182CE" },
  genderText: { fontSize: 16, color: "#4A5568" },
  genderTextSelected: { color: "#3182CE", fontWeight: "500" },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: { fontSize: 14, color: "#718096" },
  loginLink: { fontSize: 14, color: "#3182CE", fontWeight: "600" },
});
