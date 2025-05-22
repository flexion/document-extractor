import docextractorLogo from 'url:../assets/docextractor-logo.svg';

interface HeaderProps {
  signOut?: () => Promise<void>;
}

export default function Headers({ signOut }: HeaderProps) {
  return (
    <>
      <div className="usa-overlay"></div>
      <header className="usa-header usa-header--basic bg-white border-bottom border-gray-5">
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <div className="usa-logo">
              <a href="/">
                <span>
                  {' '}
                  <img src={docextractorLogo} alt="doc extractor logo" />
                </span>
                <em className="usa-logo__text">DocExtractor</em>
              </a>
            </div>
          </div>

          {signOut && (
            <nav aria-label="Primary navigation" className="usa-nav">
              <button
                className="usa-button usa-button--outline"
                type="submit"
                onClick={signOut}
              >
                Sign out
              </button>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
