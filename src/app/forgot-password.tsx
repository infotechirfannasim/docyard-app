import { ThemedText } from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { styles as customStyles } from '@/constants/custom-styles';
import { useTheme } from '@/context/theme-provider';
import { useToast } from '@/context/toast-context';
import { useForgotPassword } from '@/hooks/queries/use-files';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ForgotPassword() {
  const theme = useTheme();
  const router = useRouter();
  const { setToast } = useToast();
  const { mutateAsync, isPending } = useForgotPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    try {
      const result = await mutateAsync(email.trim());
      Keyboard.dismiss();
      if (result.status === 204) {
        setToast("The provided email is not registered in the system", "error");
      } else {
        setToast("An email has been sent, Reset your password", "success");
      }
    } catch (err: any) {
      setToast(err?.response?.data?.message || err?.message || "Internet error. Please ensure a stable internet connection before trying again.", "error");
    }
  };

  return (
    <ThemedView style={[customStyles.container]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, width: "100%", justifyContent: 'center', alignItems: 'center', padding: 20, alignSelf: 'center' }}>
            {/* <View style={styles.header}>
              <DocyardLogo width={200} height={120} />
            </View> */}

            <View style={styles.form}>
              <ThemedText type="extraLargeBold" style={{ width: "100%", textAlign: "center", marginBottom: 8 }}>Forgot Password</ThemedText>

              <View style={{ width: "100%" }}>
                <ThemedText style={{ marginBottom: 6 }} type="mediumBold">Email <ThemedText type="mediumBold" style={{ color: "red" }}>*</ThemedText></ThemedText>
                <ThemedTextInput
                  style={{ padding: 10 }}
                  placeholder="email"
                  value={email}
                  icon='at'
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {isPending ? (
                <View style={{ minWidth: '100%', paddingVertical: 12, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={theme.theme.primary} />
                </View>
              ) : (
                <TouchableOpacity activeOpacity={0.85} style={{ minWidth: '100%' }} disabled={isPending || email.length < 5} onPress={handleSubmit}>
                  <LinearGradient

                    colors={isPending || email.length < 5 ? ['#cccccc', '#cccccc', '#cccccc'] : ['#1039C1','#1D8BDD', '#CD3EF9']} // dark blue -> purple
                    locations={[0, 0.55, 1]}

                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ThemedText type={'smallBold'} style={{ color: '#fff' }}>
                      Continue
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
                // <Host style={{ minWidth: '100%', backgroundColor: theme.theme.primary }}>
                //   <Button disabled={isPending || email.length < 5} title="Continue" onPress={handleSubmit} />
                // </Host>
              )}

              <Pressable onPress={() => router.push("/login")} style={{ borderWidth: 0.6, borderColor: theme.theme.text + "40", minWidth: "100%", alignItems: "center", paddingVertical: 10 }}>
                <ThemedText type={'smallBold'}> Login</ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {},
  form: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    width: "100%",
  },
});
