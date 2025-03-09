import { Container } from '@/shared/ui'
import styles from './_Roll.module.scss'
import { NumbersAnimation } from './NumbersAnimation'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from '@/shared/hooks'
import { postRollsPlayAction } from '@/store/api-actions'


export const Roll = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => { // наверное надо дожидаться здесь пока ответ не придёт иначе прикола нет
    dispatch(postRollsPlayAction());
  },[dispatch])

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/results');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.root}>
      <video
        className={styles.videoBackground}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/images/video.webm" type="video/webm" />
      </video>
      <div className={styles.videoOverlay}></div>

      <Container className={styles.container}>
        <NumbersAnimation />
        <span className={styles.text}>move your finger <br />
        across the screen</span>
      </Container>
    </div>
  );
}
