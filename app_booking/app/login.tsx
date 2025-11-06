import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Input from "../components/Input";
import axiosInstance from "../utils/axiosInstance";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const onLogin = async () => {
    // Validate email
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email)) {
      Alert.alert("Lỗi", "Email phải có định dạng @gmail.com");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/login", {
        email: email,
        password: password,
      });

      const data = res?.data;
      if (!data) throw new Error("No data");

      // Trường hợp 403: tài khoản chưa kích hoạt
      if (res.status === 403) {
        Alert.alert(
          "Tài khoản chưa kích hoạt",
          data.message || "Tài khoản chưa được kích hoạt. Vui lòng hoàn tất đăng ký."
        );
        return;
      }

      const accessToken = data.token;
      const refreshToken = data.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Không nhận được token từ server");
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem(
        "userProfile",
        JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        })
      );

      Alert.alert("Thành công", "Đăng nhập thành công!");
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("Login error:", e?.response?.data);
      const errorMessage =
        e?.response?.data?.message || e?.response?.data?.errors || "Sai thông tin đăng nhập";
      Alert.alert("Đăng nhập thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LG</Text>
          </View>
          <Text style={styles.logoTitle}>live Green</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Let's get you Login!</Text>
          <Text style={styles.subtitle}>Enter your information below</Text>
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <View style={styles.socialButtonWrapper}>
            <Button
              title="Google"
              onPress={() => { }}
              variant="outline"
              icon="logo-google"
              iconPosition="left"
              fullWidth={true}
            />
          </View>
          <View style={styles.socialSpacer} />
          <View style={styles.socialButtonWrapper}>
            <Button
              title="Facebook"
              onPress={() => { }}
              variant="outline"
              icon="logo-facebook"
              iconPosition="left"
              fullWidth={true}
            />
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Or login with</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          <Button
            title="Login"
            onPress={onLogin}
            variant="primary"
            isLoading={loading}
            disabled={!isFormValid}
          />
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/register")}
          >
            Register Now
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
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
  logoText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3182CE",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3182CE",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
  },
  socialContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  socialButtonWrapper: {
    flex: 1,
  },
  socialSpacer: {
    width: 12,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#718096",
  },
  form: {
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#3182CE",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: "#718096",
  },
  registerLink: {
    fontSize: 14,
    color: "#3182CE",
    fontWeight: "600",
  },
});
