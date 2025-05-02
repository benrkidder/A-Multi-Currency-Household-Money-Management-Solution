import React, { useState, useEffect } from 'react'
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Text,
  TouchableOpacity, // More customizable than Button
} from 'react-native'
import { supabase } from '../../../utils/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Tells Supabase Auth to continuously refresh the session automatically if
  // the app is in the foreground. When this is added, you will continue to receive
  // `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
  // if the user's session is terminated. This should only be registered once.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh()
      } else {
        supabase.auth.stopAutoRefresh()
      }
    })

    return () => subscription.remove()
  }, [])

  // Simple client-side validation for email and password
  function validateForm() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.')
      return false
    }

    if (!password || password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.')
      return false
    }

    return true
  }

  async function signInWithEmail() {
    if (!validateForm()) return // Prevent sign-in if validation fails

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert('Sign-in Error', error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    if (!validateForm()) return // Prevent sign-up if validation fails

    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert('Sign-up Error', error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    // KeyboardAvoidingView helps push content up when keyboard appears
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888" // Light gray placeholder text
          value={email}
          onChangeText={setEmail} // Updates the email state
          keyboardType="email-address" // Shows email keyboard layout
          autoCapitalize="none" // Prevents auto-capitalization
          autoComplete="email" // Helps with autofill
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword} // Updates the password state
          secureTextEntry={true} // Hides the password input
          autoComplete="password" // Helps with autofill
        />

        <TouchableOpacity style={styles.button} onPress={signInWithEmail}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={signUpWithEmail}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Forgot Password pressed')}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen
    backgroundColor: '#f0f0f0', // Light background color
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    paddingHorizontal: 30, // Add some side padding
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff', // White background for input
    borderWidth: 1,
    borderColor: '#ccc', // Gray border
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333', // Dark text color
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF', // Blue background color (iOS style)
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10, // Add some space above the button
  },
  buttonText: {
    color: '#fff', // White text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    marginTop: 15,
    fontSize: 14,
  },
})
