import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsConditionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3182CE" />
        </TouchableOpacity>
        <Text style={styles.title}>Điều khoản & Điều kiện</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updateDate}>Cập nhật lần cuối: 25/6/2022</Text>
        
        <Text style={styles.paragraph}>
          Vui lòng đọc kỹ các điều khoản dịch vụ trước khi sử dụng ứng dụng của chúng tôi.
        </Text>

        <Text style={styles.link}>Điều kiện sử dụng</Text>

        <Text style={styles.paragraph}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
          Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
          when an unknown printer took a galley of type and scrambled it to make a type 
          specimen book. It has survived not only five centuries, but also the leap into 
          electronic typesetting, remaining essentially unchanged.
        </Text>

        <Text style={styles.paragraph}>
          It was popularised in the 1960s with the release of Letraset sheets containing 
          Lorem Ipsum passages, and more recently with desktop publishing software like 
          Aldus PageMaker including versions of Lorem Ipsum.
        </Text>

        <Text style={styles.paragraph}>
          Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots 
          in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#2D3748" },
  content: { padding: 20 },
  updateDate: { fontSize: 14, color: "#718096", marginBottom: 16 },
  paragraph: { fontSize: 16, color: "#4A5568", lineHeight: 24, marginBottom: 16 },
  link: { fontSize: 18, color: "#3182CE", fontWeight: "600", marginBottom: 16 },
});

