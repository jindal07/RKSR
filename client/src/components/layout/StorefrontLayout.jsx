import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PillNavbar from './PillNavbar.jsx';
import Footer from './Footer.jsx';
import AnimatedBackground from '../background/AnimatedBackground.jsx';
import AnnouncementBanner from './AnnouncementBanner.jsx';
import { api } from '../../services/api.js';

export default function StorefrontLayout() {
  const location = useLocation();
  const [banner, setBanner] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    api.get('/banner')
      .then(({ data }) => {
        setBanner(data.banner);
        setExpired(Boolean(data.banner.endsAt) && new Date(data.banner.endsAt) <= new Date());
      })
      .catch(() => {});
  }, []);

  const showBanner = Boolean(banner?.enabled && banner?.text && !expired);

  // Scroll to top after the outgoing page finishes its exit animation.
  // Applies to every navigation (incl. back/forward) — browser scroll
  // restoration is disabled in index.html so refresh always starts at the top.
  const handleExitComplete = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <>
      <AnimatedBackground />
      {showBanner && <AnnouncementBanner banner={banner} onExpire={() => setExpired(true)} />}
      <PillNavbar />
      <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 pt-[calc(5.5rem+var(--banner-h,0px))] sm:px-6 sm:pt-[calc(6rem+var(--banner-h,0px))] lg:px-8 lg:pt-[calc(7rem+var(--banner-h,0px))]"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
