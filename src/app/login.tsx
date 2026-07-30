import DocyardLogo from '@/assets/images/logo/docyard-logo-dark.svg';
import { ThemedText } from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { styles as customStyles } from '@/constants/custom-styles';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { Host } from '@expo/ui/jetpack-compose';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function Login() {
  const theme = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('irfan.nasim');
  const [password, setPassword] = useState('P@ssw0rd*1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
      router.replace("/(drawer)/(tabs)/home" as any);
    } catch (err) {      
      setErrorMessage(err instanceof Error ? err.message : `${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [isChecked, setChecked] = useState(false);

  return (
    <ThemedView style={[customStyles.container, ]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView  contentContainerStyle={{
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
    }}
      keyboardShouldPersistTaps="handled"
    >
        <View style={{flex: 1, width: "100%", height: "100%",  justifyContent: 'center', alignItems: 'center', padding: 20, alignSelf: 'center'}}>

      <View style={styles.header}>
        <DocyardLogo width={200} height={120} />
      </View>
       {errorMessage && (
        <View style={{ width: "100%", justifyContent: 'center', alignItems: 'center', padding: 20, alignSelf: 'center', backgroundColor: theme.theme.onError + '20', borderRadius: 8, marginBottom: 12 }}>
        <ThemedText type={'small'} style={{ color: "red" }}>{errorMessage}</ThemedText>

      </View>
      )}

      <View style={styles.form}>
        <View style={{ width: "100%" }}>
          <ThemedText style={{ marginBottom: 6 }} type="mediumBold">Username <ThemedText type="mediumBold" style={{ color: "red"}}>*</ThemedText></ThemedText>
          <ThemedTextInput style={{ padding: 10 }} placeholder='Enter your username' value={username} icon="at" onChangeText={setUsername}></ThemedTextInput>
        </View>

        <View style={{ width: "100%" }}>
          <ThemedText style={{ marginBottom: 6 }} type="mediumBold">Password <ThemedText type="mediumBold" style={{ color: "red" }}>*</ThemedText></ThemedText>
          <ThemedTextInput style={{ padding: 10, }} isPassword={true} placeholder='Enter your password' secureTextEntry={true} value={password} onChangeText={setPassword}></ThemedTextInput>
        </View>


        <View style={styles.rememberMe}>
          {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Checkbox style={styles.rememberMeCheckbox} value={isChecked} onValueChange={setChecked}></Checkbox>
            <ThemedText type={'small'}>Remember me</ThemedText>
          </View> */}
          <Pressable onPress={() => router.push("/forgot-password")}>
            <ThemedText type={'linkPrimary'}>Forgot Password</ThemedText>
          </Pressable>
        </View>

          {isSubmitting ? (
            <View style={{ minWidth: '100%', width: '100%', paddingVertical: 12, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.theme.primary} />
            </View>
          ) : (
          <Host style={{minWidth: '100%', width: '100%', backgroundColor: theme.theme.primary, overflow: 'hidden' }}>
          <Button disabled={isSubmitting} title="Login" onPress={() => handleLogin()}></Button>
          </Host>
          )}
      </View>
        </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {

  },
  form: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    width: "100%",
  },
  rememberMe: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rememberMeCheckbox: {
    borderRadius: 0,
  }
});