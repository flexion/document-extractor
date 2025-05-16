import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export function useSignInPage(setAuthToken: (token: string) => void) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    // clear previous error messages:
    setUsernameError('');
    setPasswordError('');
    setFormError('');
    setLoading(true);

    let hasError = false;

    if (!username) {
      setUsernameError('Please enter your username');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      hasError = true;
    }

    if (hasError) {
      setLoading(false); // hide spinner if validation failed
      return;
    }

    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("The email or password you've entered is wrong.");
      }

      const data = await res.json();

      // store the token
      setAuthToken(data.access_token);
      // redirect to upload page
      navigate('/upload-document');
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred');
      }
    } finally {
      setLoading(false); // remove spinner in all cases after request finishes
    }
  }

  async function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  async function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  return {
    loading,
    formError,
    usernameError,
    passwordError,
    handleUsernameChange,
    handlePasswordChange,
    handleLogin,
  };
}
