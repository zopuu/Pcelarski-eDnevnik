import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { registerSchema, RegisterFormValues } from '@/features/auth/schemas/register-schema';
import { useRegister } from '@/features/auth/hooks/use-register';
import { ApiError } from '@/shared/api/api-error';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const validationErrors = error.problem?.errors;

    if (validationErrors) {
      const firstMessage = Object.values(validationErrors).flat().find(Boolean);

      if (firstMessage) {
        return firstMessage;
      }
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Registracija nije uspela.';
}

export function RegisterScreen() {
  const registration = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      hid: '',
      phone: '',
      agriculturalHoldingNumber: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registration.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,

        hid: values.hid.trim() || null,

        phone: values.phone.trim() || null,

        agriculturalHoldingNumber: values.agriculturalHoldingNumber
          ? Number(values.agriculturalHoldingNumber)
          : null,
      });

      router.replace({
        pathname: '/login',
        params: {
          registered: '1',
        },
      });
    } catch {
      // Mutation state displays the error below.
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.title}>Kreiranje naloga</Text>

          <Text style={styles.subtitle}>Unesite osnovne podatke za registraciju.</Text>

          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormField
                label="Ime"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.firstName?.message}
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormField
                label="Prezime"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.lastName?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormField
                label="Email"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormField
                label="Lozinka"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormField
                label="Potvrdite lozinku"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
            )}
          />

          <Controller
            control={control}
            name="hid"
            render={({ field }) => (
              <FormField
                label="HID"
                optional
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.hid?.message}
                autoCapitalize="characters"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormField
                label="Telefon"
                optional
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            )}
          />

          <Controller
            control={control}
            name="agriculturalHoldingNumber"
            render={({ field }) => (
              <FormField
                label="Broj gazdinstva"
                optional
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.agriculturalHoldingNumber?.message}
                keyboardType="number-pad"
              />
            )}
          />

          {registration.isError && (
            <Text style={styles.apiError}>{getErrorMessage(registration.error)}</Text>
          )}

          <Pressable
            disabled={registration.isPending}
            onPress={handleSubmit(onSubmit)}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              registration.isPending && styles.disabled,
            ]}
          >
            {registration.isPending ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryButtonText}>Registruj se</Text>
            )}
          </Pressable>

          <Pressable
            disabled={registration.isPending}
            onPress={() => router.replace('/login')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Već imate nalog? Prijavite se</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FormFieldProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  error?: string;
  optional?: boolean;
}

function FormField({ label, error, optional = false, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {optional ? ' (opciono)' : ''}
      </Text>

      <TextInput
        {...inputProps}
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor="#777"
      />

      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  form: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 16,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },

  inputError: {
    borderColor: '#b00020',
  },

  fieldError: {
    marginTop: 5,
    color: '#b00020',
    fontSize: 13,
  },

  apiError: {
    marginBottom: 16,
    color: '#b00020',
  },

  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#222',
  },

  primaryButtonPressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    alignItems: 'center',
    padding: 16,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
