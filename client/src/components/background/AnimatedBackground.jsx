import { useEffect, useState } from 'react';
import ShapeGrid from './ShapeGrid.jsx';

// Watches the `dark` class on <html> so the canvas colors follow the theme toggle.
function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

export default function AnimatedBackground() {
  const dark = useIsDark();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <ShapeGrid
        speed={0.35}
        squareSize={44}
        direction="diagonal"
        shape="square"
        hoverTrailAmount={6}
        borderColor={dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)'}
        hoverFillColor={dark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.22)'}
        vignetteColor={dark ? '#0a0a0a' : '#fafafa'}
      />
    </div>
  );
}
