"use client"
import styled from '@emotion/styled';
import Card from './Card';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion';

import DotGrid from './DotGrid';
import { useEffect, useRef } from 'react';


const CardEffect = ({ children }: { children: React.ReactNode }) => {

  // mouse position
  const mouseX = useMotionValue(
    typeof window !== 'undefined' ? window.innerWidth / 2 : 0
  );
  const mouseY = useMotionValue(
    typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  );

  const Container = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    perspective: 1000px;
    `;

  const RotationWrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
`;

  const CardWrapper = styled(motion.div)`
  border-radius: 20px;
  backdrop-filter: blur(3px) brightness(120%);
`;

  const cardRef = useRef<HTMLDivElement>(null);

  const dampen = 100;
  const rotateX = useTransform<number, number>(mouseY, (newMouseY) => {
    if (!cardRef.current) return 0;
    const rect = cardRef.current.getBoundingClientRect();
    const newRotateX = newMouseY - rect.top - rect.height / 2;
    return -newRotateX / dampen;
  });
  const rotateY = useTransform(mouseX, (newMouseX) => {
    if (!cardRef.current) return 0;
    const rect = cardRef.current.getBoundingClientRect();
    const newRotateY = newMouseX - rect.left - rect.width / 2;
    return newRotateY / dampen;
  });

  const diagonalMovement = useTransform<number, number>(
    [rotateX, rotateY],
    ([newRotateX, newRotateY]) => {
      const position: number = newRotateX + newRotateY;
      return position;
    }
  );
  const sheenPosition = useTransform(
    diagonalMovement,
    [-5, 5],
    [-100, 200]
  );
  const sheenOpacity = useTransform(
    sheenPosition,
    [-100, 50, 200],
    [0, 0.05, 0]
  );
  const sheenGradient = useMotionTemplate`linear-gradient(
    55deg,
    transparent,
    rgba(255 255 255 / ${sheenOpacity}) ${sheenPosition}%,
    transparent)`;



  // handle mouse move on document
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // animate mouse x and y
      animate(mouseX, e.clientX);
      animate(mouseY, e.clientY);
    };
    if (typeof window === 'undefined') return;
    // recalculate grid on resize
    window.addEventListener('mousemove', handleMouseMove);
    // cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <Container>
      <RotationWrapper style={{ rotateX, rotateY }}>
        <CardWrapper ref={cardRef} style={{ backgroundImage: sheenGradient }}>
          <Card>
            {children}
          </Card>
        </CardWrapper>
      </RotationWrapper>
    </Container>
  );
}

export default CardEffect;