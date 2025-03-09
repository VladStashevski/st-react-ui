import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './_SpinWheel.module.scss';

interface SpinWheelProps {
  sections: {
    id: number;
    label: string | React.ReactNode;
  }[];
  onSectionSelected?: (section: number) => void;
  initialRotation?: number;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  sections = [],
  onSectionSelected,
  initialRotation = 0,
}) => {
  const [rotation, setRotation] = useState<number>(initialRotation);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startAngle, setStartAngle] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const lastRotation = useRef<number>(initialRotation);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

  const sectionAngle = useMemo(() => 360 / sections.length, [sections.length]);

  const getAngle = useCallback((x: number, y: number): number => {
    const wheelElement = wheelRef.current;
    if (!wheelElement) return 0;

    const rect = wheelElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;
    
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const activePosition = ((normalizedRotation + 270) % 360);
    const activeIndex = Math.floor(activePosition / sectionAngle);
    
    setActiveSection(sections[activeIndex]?.id ?? null);
  }, [rotation, sections, sectionAngle]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const angle = getAngle(e.clientX, e.clientY);
    setStartAngle(angle - rotation);
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  }, [getAngle, rotation]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      const angle = getAngle(touch.clientX, touch.clientY);
      setStartAngle(angle - rotation);
      lastMousePosition.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [getAngle, rotation]);

  const calculateNewRotation = useCallback((currentX: number, currentY: number) => {
    const currentAngle = getAngle(currentX, currentY);
    const newRotation = currentAngle - startAngle;
    
    if (lastMousePosition.current) {
      const deltaX = currentX - lastMousePosition.current.x;
      const deltaY = currentY - lastMousePosition.current.y;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        const direction = deltaX * (currentY - lastMousePosition.current.y) > 0 ? 1 : -1;
        const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.1;
        lastRotation.current = newRotation + direction * speed;
      } else {
        lastRotation.current = newRotation;
      }
    } else {
      lastRotation.current = newRotation;
    }
    
    setRotation(lastRotation.current);
    lastMousePosition.current = { x: currentX, y: currentY };
  }, [getAngle, startAngle]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    calculateNewRotation(e.clientX, e.clientY);
  }, [isDragging, calculateNewRotation]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    calculateNewRotation(touch.clientX, touch.clientY);
    
    e.preventDefault();
  }, [isDragging, calculateNewRotation]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    lastMousePosition.current = null;
    
    if (onSectionSelected && sections.length > 0 && activeSection !== null) {
      onSectionSelected(activeSection);
    }
  }, [isDragging, onSectionSelected, sections.length, activeSection]);

  const handleMouseUp = handleEnd;
  const handleTouchEnd = handleEnd;

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const wheelStyle = useMemo(() => ({ 
    '--rotation': `${rotation}deg`,
  } as React.CSSProperties), [rotation]);

  return (
    <div 
      className={styles['spin-wheel-container']}
      style={wheelStyle}
    >
      <div 
        ref={wheelRef}
        className={`${styles['spin-wheel']} ${isDragging ? styles['no-transition'] : styles['with-transition']}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {sections.map((section, index) => {
          const isActive = section.id === activeSection;
          const sectionStyle = {
            '--section-rotation': `${index * sectionAngle}deg`,
          } as React.CSSProperties;
          
          return (
            <div
              key={section.id}
              className={`${styles['spin-wheel-section']} ${isActive ? styles['active-section'] : ''}`}
              style={sectionStyle}
            >
              <div className={`${styles['section-content']} ${isActive ? styles['active-content'] : ''}`}>
                {section.label}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles['spin-wheel-pointer']}></div>
    </div>
  );
};


{/* <SpinWheel
sections={Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  label: String(i + 1)
}))}
/> */}