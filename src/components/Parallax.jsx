import { useEffect, useRef, useState } from 'react';

export default function Parallax({ 
  children, 
  speed = 0.5, 
  direction = 'vertical',
  className = '',
  offset = 0,
  disabled = false
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (!elementRef.current || !isVisible) return;

      const rect = elementRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how visible the element is in the viewport
      const visibility = 1 - Math.max(0, Math.min(1, 
        (rect.top + rect.height / 2) / (windowHeight + rect.height)
      ));
      
      setScrollPosition(visibility);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible, disabled]);

  const getTransform = () => {
    if (disabled) return '';

    const amount = scrollPosition * speed * 100;
    
    switch(direction) {
      case 'vertical':
        return `translateY(${offset + amount}px)`;
      case 'horizontal':
        return `translateX(${offset + amount}px)`;
      case 'scale':
        const scale = 1 + (scrollPosition * speed * 0.5);
        return `scale(${scale})`;
      case 'rotate':
        const rotate = scrollPosition * speed * 20;
        return `rotate(${rotate}deg)`;
      case 'fade':
        const opacity = 0.3 + (scrollPosition * speed);
        return `translateY(${offset + scrollPosition * speed * 50}px)`;
      default:
        return `translateY(${offset + scrollPosition * speed * 100}px)`;
    }
  };

  return (
    <div 
      ref={elementRef}
      className={`parallax-content ${className}`}
      style={{
        transform: getTransform(),
        transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}