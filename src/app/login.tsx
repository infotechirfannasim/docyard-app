import DocyardLogo from '@/assets/images/logo/docyard-logo-dark.svg';
import { ThemedText } from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { styles as customStyles } from '@/constants/custom-styles';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { Host } from '@expo/ui/jetpack-compose';
import { Checkbox } from 'expo-checkbox';
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

export default function Login() {
  const theme = useTheme();
  const { login } = useAuth();
  const [isChecked, setChecked] = useState(false);
  return (
    
    <ThemedView style={[customStyles.container, ]}>
      <ScrollView  contentContainerStyle={{
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
    }} >
        <View style={{flex: 1, width: "100%", height: "100%",  justifyContent: 'center', alignItems: 'center', padding: 20, alignSelf: 'center'}}>

      <View style={styles.header}>
        <DocyardLogo width={200} height={120} />
      </View>
      <View style={styles.form}>
        <View style={{ width: "100%" }}>
          <ThemedText style={{ marginBottom: 6 }} type="mediumBold">Username</ThemedText>
          <ThemedTextInput style={{ padding: 10 }} placeholder='Enter your username' onChange={(value) => console.log(value)}></ThemedTextInput>
        </View>

        <View style={{ width: "100%" }}>
          <ThemedText style={{ marginBottom: 6 }} type="mediumBold">Password</ThemedText>
          <ThemedTextInput style={{ padding: 10, }} isPassword={true} placeholder='Enter your password' secureTextEntry={true}  onChange={(value) => console.log(value)}></ThemedTextInput>
        </View>


        <View style={styles.rememberMe}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Checkbox style={styles.rememberMeCheckbox} value={isChecked} onValueChange={setChecked}></Checkbox>
            <ThemedText type={'small'}>Remember me</ThemedText>
          </View>
          <ThemedText type={'link'}>Forgot Password</ThemedText>
        </View>

          <Host style={{minWidth: '100%', width: '100%', backgroundColor: theme.theme.primary,  overflow: 'hidden' }}>

          <Button title="Login" onPress={() => login()}></Button>
          </Host>
      </View>
        </View>
    </ScrollView>
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
    justifyContent: 'space-between',
  },
  rememberMeCheckbox: {
    borderRadius: 8,
  }
});