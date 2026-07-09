import { useTheme } from '@/context/theme-provider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';

type ThemedTextInputProps = TextInputProps & {
  isPassword?: boolean;
};

export default function ThemedTextInput({ style, isPassword, secureTextEntry, ...props }: ThemedTextInputProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ width: '100%', justifyContent: 'center' }}>
      <TextInput
        placeholderTextColor={theme.theme.text + "80"}
        secureTextEntry={isPassword ? !showPassword : secureTextEntry}
        style={[
          {
            color: theme.theme.text,
            borderColor: theme.theme.text,
            borderWidth: 1,
            // borderRadius: 10,
            paddingRight: isPassword ? 40 : undefined,
          },
          style,
        ]}
        {...props}
      />

      {isPassword && (
        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          style={{ position: 'absolute', right: 12 }}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.theme.text}
          />
        </Pressable>
      )}
    </View>
  );
}