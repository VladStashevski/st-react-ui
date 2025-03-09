import { useRef, useState, useEffect } from 'react';
import Marquee from 'react-fast-marquee';
import styles from './NumbersAnimation.module.scss';

// Данные для каждой линии
const laneData = [
  // Линия 0 (верхняя)
  {
    items: [
      { id: 'percent-1-0', value: '12%' },
      { id: 'percent-2-0', value: '49%' },
      { id: 'percent-3-0', value: '85%' },
      { id: 'percent-4-0', value: '150%' },
    ],
    speed: 40,
    delay: 0,
    direction: 'left' as const,
    className: styles.lane0
  },
  // Линия 1
  {
    items: [
      { id: 'percent-1-1', value: '3%' },
      { id: 'percent-2-1', value: '35%' },
      { id: 'percent-3-1', value: '70%' },
      { id: 'percent-4-1', value: '115%' },
    ],
    speed: 25,
    delay: 0,
    direction: 'left' as const,
    className: styles.lane1
  },
  // Линия 2
  {
    items: [
      { id: 'percent-1-2', value: '1%' },
      { id: 'percent-2-2', value: '26%' },
      { id: 'percent-3-2', value: '63%' },
      { id: 'percent-4-2', value: '100%' },
      { id: 'percent-5-2', value: '200%' },
    ],
    speed: 35,
    delay: 0,
    direction: 'left' as const,
    className: styles.lane2
  },
  // Линия 3 (нижняя)
  {
    items: [
      { id: 'percent-1-3', value: '7%' },
      { id: 'percent-2-3', value: '43%' },
      { id: 'percent-3-3', value: '76%' },
      { id: 'percent-4-3', value: '130%' },
    ],
    speed: 42,
    delay: 0,
    direction: 'left' as const,
    className: styles.lane3
  },
];

export const NumbersAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(1);
  const [tapPosition, setTapPosition] = useState<{ x: number, y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const inertiaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ x: number, y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetSpeedRef = useRef<number>(1);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Плавное изменение скорости
  useEffect(() => {
    const updateSpeed = () => {
      if (Math.abs(speed - targetSpeedRef.current) < 0.1) {
        setSpeed(targetSpeedRef.current);
      } else {
        setSpeed(prevSpeed => prevSpeed + (targetSpeedRef.current - prevSpeed) * 0.1);
        animationFrameRef.current = requestAnimationFrame(updateSpeed);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateSpeed);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed]);

  // Функция для постепенного увеличения скорости при удержании
  const startHoldAcceleration = () => {
    // Сначала небольшая задержка перед началом ускорения
    holdTimeoutRef.current = setTimeout(() => {
      // Затем постепенное увеличение скорости
      let currentHoldSpeed = 2;

      holdIntervalRef.current = setInterval(() => {
        currentHoldSpeed = Math.min(currentHoldSpeed + 0.2, 3.5); // Максимум 3.5 при удержании
        targetSpeedRef.current = currentHoldSpeed;
      }, 200); // Увеличиваем каждые 200мс
    }, 300); // Задержка 300мс
  };

  // Функция для очистки таймеров удержания
  const clearHoldTimers = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // Обработчики событий для управления скоростью
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем стандартное поведение браузера
    targetSpeedRef.current = 2; // Более плавное начальное ускорение
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    setTapPosition({ x: e.clientX, y: e.clientY });
    isDraggingRef.current = true;

    if (inertiaTimeoutRef.current) {
      clearTimeout(inertiaTimeoutRef.current);
      inertiaTimeoutRef.current = null;
    }

    // Запускаем механизм ускорения при удержании
    startHoldAcceleration();

    // Добавляем обработчики событий на document для более надежного отслеживания
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  // Глобальные обработчики для более надежного отслеживания
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isDraggingRef.current && lastPositionRef.current) {
      // При движении сбрасываем таймеры удержания
      clearHoldTimers();

      const dx = e.clientX - lastPositionRef.current.x;
      const dy = e.clientY - lastPositionRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Ограничиваем максимальную скорость и делаем её зависимой от интенсивности движения
      const maxSpeed = 4;
      const movementSpeed = Math.min(2 + (distance / 10), maxSpeed);
      targetSpeedRef.current = movementSpeed;

      lastPositionRef.current = { x: e.clientX, y: e.clientY };
      setTapPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleGlobalMouseUp = () => {
    isDraggingRef.current = false;
    lastPositionRef.current = null;

    // Очищаем таймеры удержания
    clearHoldTimers();

    // Плавное возвращение к нормальной скорости с инерцией
    targetSpeedRef.current = 1;

    inertiaTimeoutRef.current = setTimeout(() => {
      setTapPosition(null);
    }, 1000);

    // Удаляем глобальные обработчики
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  // Компонентные обработчики (для совместимости)
  const handleMouseMove = () => {
    // Обработка уже происходит через глобальный обработчик
  };

  const handleMouseUp = () => {
    // Обработка уже происходит через глобальный обработчик
  };

  // Обработчики для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      // Не используем preventDefault здесь, так как это может блокировать скролл
      targetSpeedRef.current = 2; // Более плавное начальное ускорение
      lastPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTapPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      isDraggingRef.current = true;

      if (inertiaTimeoutRef.current) {
        clearTimeout(inertiaTimeoutRef.current);
        inertiaTimeoutRef.current = null;
      }

      // Запускаем механизм ускорения при удержании
      startHoldAcceleration();

      // Добавляем глобальные обработчики для тач-событий
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
      document.addEventListener('touchend', handleGlobalTouchEnd);
      document.addEventListener('touchcancel', handleGlobalTouchEnd);
    }
  };

  const handleGlobalTouchMove = (e: TouchEvent) => {
    if (isDraggingRef.current && lastPositionRef.current && e.touches.length > 0) {
      // При движении сбрасываем таймеры удержания
      clearHoldTimers();

      const dx = e.touches[0].clientX - lastPositionRef.current.x;
      const dy = e.touches[0].clientY - lastPositionRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Ограничиваем максимальную скорость и делаем её зависимой от интенсивности движения
      const maxSpeed = 4;
      const movementSpeed = Math.min(2 + (distance / 10), maxSpeed);
      targetSpeedRef.current = movementSpeed;

      lastPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTapPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleGlobalTouchEnd = () => {
    isDraggingRef.current = false;
    lastPositionRef.current = null;

    // Очищаем таймеры удержания
    clearHoldTimers();

    // Плавное возвращение к нормальной скорости с инерцией
    targetSpeedRef.current = 1;

    inertiaTimeoutRef.current = setTimeout(() => {
      setTapPosition(null);
    }, 1000);

    // Удаляем глобальные обработчики
    document.removeEventListener('touchmove', handleGlobalTouchMove);
    document.removeEventListener('touchend', handleGlobalTouchEnd);
    document.removeEventListener('touchcancel', handleGlobalTouchEnd);
  };

  // Компонентные обработчики (для совместимости)
  const handleTouchMove = () => {
    // Обработка уже происходит через глобальный обработчик
  };

  const handleTouchEnd = () => {
    // Обработка уже происходит через глобальный обработчик
  };

  // Очистка таймаутов и обработчиков при размонтировании
  useEffect(() => {
    return () => {
      if (inertiaTimeoutRef.current) {
        clearTimeout(inertiaTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearHoldTimers();
      // Удаляем глобальные обработчики при размонтировании
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, []);

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ pointerEvents: 'auto' }}
    >
      {laneData.map((lane, index) => (
        <div key={`lane-${index}`} className={`${styles.lane} ${lane.className}`}>
          <Marquee
            speed={lane.speed * speed}
            delay={lane.delay}
            direction={lane.direction}
            gradient={false}
            pauseOnHover={false}
            pauseOnClick={false}
            className="fast-marquee"
            autoFill={true}
          >
            {lane.items.map((item) => (
              <div key={item.id} className={styles.number} data-lane={index}>
                {item.value}
              </div>
            ))}
          </Marquee>
        </div>
      ))}

      {tapPosition && (
        <div
          className={styles.tapEffect}
          style={{
            left: tapPosition.x,
            top: tapPosition.y,
            opacity: isDraggingRef.current ? 1 : 0.8
          }}
        />
      )}
    </div>
  );
};
