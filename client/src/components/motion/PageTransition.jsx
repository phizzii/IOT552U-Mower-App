import { useEffect, useRef } from 'react';
import { createTimeline, stagger } from 'animejs';

function PageTransition({ children, pathname }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const revealNodes = containerRef.current.querySelectorAll('[data-reveal]');
    const timeline = createTimeline({
      defaults: {
        duration: 520,
        ease: 'out(3)',
      },
    });

    timeline
      .add(containerRef.current, {
        opacity: [0, 1],
        translateY: ['16px', '0px'],
      });

    if (revealNodes.length > 0) {
      timeline.add(
        revealNodes,
        {
          delay: stagger(65),
          opacity: [0, 1],
          translateY: ['24px', '0px'],
        },
        90
      );
    }

    return () => {
      if (timeline.cancel) {
        timeline.cancel();
      }
    };
  }, [pathname]);

  return (
    <div className="page-transition" ref={containerRef}>
      {children}
    </div>
  );
}

export default PageTransition;
