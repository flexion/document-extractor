import { useEffect } from 'react';

import Layout from '../components/Layout';
import { useNavigate } from 'react-router';

export default function NotSignedInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="site-wrapper bg-primary-lighter grid-row flex-column minh-viewport flex-align-center flex-justify-center">
        <div className="bg-white margin-top-10 radius-md padding-y-4 card margin-x-auto width-tablet tablet:padding-y-8 padding-x-2 tablet:padding-x-10 tablet:margin-bottom-8">
          <h1>You&#39;re not signed in</h1>
          Please sign in first. You will be navigated to the sign in page in a
          few seconds.
        </div>
      </div>
    </Layout>
  );
}
