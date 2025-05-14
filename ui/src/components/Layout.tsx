import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';

interface LayoutProps {
  signOut?: () => Promise<void>;
  children: ReactNode;
}

export default function Layout({ signOut, children }: LayoutProps) {
  return (
    <>
      <Header signOut={signOut} />
      <div>{children}</div>
      <Footer />
    </>
  );
}
