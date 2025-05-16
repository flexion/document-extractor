import Layout from '../../components/Layout';
import { useSignInPage } from './useSignInPage.ts';

interface SignInPageProps {
  setAuthToken: (token: string) => void;
  justSignedOut: boolean;
}

export default function SignInPage({
  setAuthToken,
  justSignedOut,
}: SignInPageProps) {
  const {
    loading,
    formError,
    usernameError,
    passwordError,
    handleUsernameChange,
    handlePasswordChange,
    handleLogin,
  } = useSignInPage(setAuthToken);

  return (
    <Layout>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content-el">
            <div className="loading-content">
              <p className="font-body-lg text-semi-bold">Signing in...</p>
              <div className="spinner" aria-label="loading"></div>
            </div>
          </div>
        </div>
      )}
      <div className="site-wrapper bg-primary-lighter grid-row flex-column minh-viewport flex-align-center flex-justify-center">
        <div className="bg-white margin-top-10 radius-md padding-y-4 card margin-x-auto width-tablet tablet:padding-y-8 padding-x-2 tablet:padding-x-10 tablet:margin-bottom-8">
          {formError && (
            <div className="usa-alert usa-alert--error">
              <div className="usa-alert__body">
                <p className="usa-alert__text">{formError}</p>
              </div>
            </div>
          )}

          {justSignedOut && (
            <div className="usa-alert usa-alert--info">
              <div className="usa-alert__body">
                <p className="usa-alert__text">Signed out successfully.</p>
              </div>
            </div>
          )}

          <h1>Sign in for existing users</h1>

          <form onSubmit={handleLogin} id="signin-form">
            <div className="usa-form-group usa">
              <label className="usa-label" htmlFor="username">
                Username
              </label>
              {usernameError && (
                <span className="usa-error-message" role="alert">
                  {usernameError}
                </span>
              )}
              <input
                className="usa-input usa-input--big"
                id="username"
                name="username"
                onChange={handleUsernameChange}
              />
            </div>

            <div className="usa-form-group">
              <label className="usa-label" htmlFor="input-type-text">
                Password
              </label>
              {passwordError && (
                <span className="usa-error-message" role="alert">
                  {passwordError}
                </span>
              )}
              <input
                className="usa-input margin-bottom-2 usa-input--big"
                id="password"
                name="password"
                type="password"
                onChange={handlePasswordChange}
              />
            </div>
            <button
              type="submit"
              className="usa-button usa-button--big width-full"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
