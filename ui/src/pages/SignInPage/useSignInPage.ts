import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { callCreateTokenApi } from './signInPageController.ts';

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

    if (!username) {
      setUsernameError('Please enter your username');
      setLoading(false); // hide spinner if validation failed
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      setLoading(false); // hide spinner if validation failed
      return;
    }

    const { responseData, failure } = await callCreateTokenApi(
      username,
      password
    );

    if (failure) {
      setFormError(failure);
      setLoading(false);
      return;
    }

    if (!responseData) {
      setFormError('Login failed unexpectedly.  Please try again later.');
      setLoading(false);
      return;
    }

    // store the token
    setAuthToken(responseData.access_token);
    // redirect to upload page
    navigate('/upload-document');
    setLoading(false);
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
