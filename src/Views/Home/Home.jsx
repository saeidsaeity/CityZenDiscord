import { Suspense, useEffect, useRef, useState } from 'react';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';

import { MdOutlineMusicOff } from 'react-icons/md';
import { SlMusicTone } from 'react-icons/sl';

import Header from '../../components/Header/Header';

import { CitizenRed } from '../../assets/citizens/CitizenRed';
import { CitizenBlue } from '../../assets/citizens/CitizenBlue';
import { CitizenGreen } from '../../assets/citizens/CitizenGreen';
import { CitizenYellow } from '../../assets/citizens/CitizenYellow';

import useSound from 'use-sound';
import opening from '/GameSound1.mp3';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import aboutText from './aboutData';
import { gsap } from 'gsap';
import Rules from './Rules';
import ProjectDescription from './ProjectDescription';

import TileA from '../../assets/tiles/tileA';
import TileD from '../../assets/tiles/tileD';
import TileE from '../../assets/tiles/tileE';
import TileF from '../../assets/tiles/tileF';
import TileK from '../../assets/tiles/tileK';
import TileS from '../../assets/tiles/tileS';
import TileU from '../../assets/tiles/tileU';
import TileX from '../../assets/tiles/tileX';

import styles from './Home.module.css';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const navigate = useNavigate();
  const [playSound] = useSound('/GameSound1.mp3');
  const [muted, setMuted] = useState(true);

  const aboutRef = useRef(null);
  
  const [sunPosition, setSunPosition] = useState([-50, 0, 250]);
  const [citizenCount, setCitizenCount] = useState(new Array(60).fill(0));
  const [ citizensRed, setCitizensRed ] = useState()
  const [ citizensBlue, setCitizensBlue ] = useState()
  const [ citizensGreen, setCitizensGreen ] = useState()
  const [ citizensYellow, setCitizensYellow ] = useState()

  const toggleMute = () => {
    setMuted(!muted);
  };
  const [play] = useSound(opening);

  useEffect(() => {
    if (!muted) {
      setTimeout(() => {
        console.log('Delayed for 1 second.');
      }, '5000');
      document.querySelector('audio').play();
      document.querySelector('audio').volume = 0.5;
    } else {
      document.querySelector('audio').pause();
    }
  }, [muted]);

  useEffect(() => {
    const aboutText = aboutRef.current.innerText;
    aboutRef.current.innerText = '';

    const letters = aboutText.split('');
    letters.forEach((letter, index) => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.opacity = '0';
      aboutRef.current.appendChild(span);

      gsap.to(span, {
        opacity: 1,
        duration: 0.3,
        delay: index * 0.025,
      });

      const redCitizens = citizenCount.map((arr, index) => {
        return (
          <RigidBody
            key={'A'+ index}
            gravityScale={0.15}
            position={[Math.random() * 10, 20, 0]}
            scale={0.095}
            friction={0.1}
            mass={1}
            rotation={[0, 0, 0]}
            canSleep={false}
            lockRotations={false}
            restitution={1}
          >
            <CitizenRed />
          </RigidBody>
        )})
      setCitizensRed(redCitizens)
    });

    const blueCitizens = citizenCount.map((arr, index) => {
      return (
        <RigidBody
          key={'B'+ index}
          gravityScale={0.1}
          position={[Math.random() * 5, 19.2, 2]}
          scale={0.095}
          friction={0.1}
          mass={1}
          rotation={[0, 0, 0]}
          canSleep={false}
          lockRotations={false}
          restitution={1}
        >
          <CitizenBlue />
        </RigidBody>
      )})
      setCitizensBlue(blueCitizens)

      const greenCitizens = citizenCount.map((arr, index) => {
        return (
          <RigidBody
            key={'C'+ index}
            gravityScale={0.15}
            position={[Math.random() * 10, 19.5, 0]}
            scale={0.095}
            friction={0.1}
            mass={1}
            rotation={[0, 0, 0]}
            canSleep={false}
            lockRotations={false}
            restitution={1}
          >
            <CitizenGreen />
          </RigidBody>
        );
      })
      setCitizensGreen(greenCitizens)

      const yellowCitizens = citizenCount.map((arr, index) => {
        return (
          <RigidBody
            key={'D'+ index}
            gravityScale={0.1}
            position={[Math.random() * 10, 20.4, 4]}
            scale={0.095}
            friction={0.1}
            mass={1}
            rotation={[0, Math.PI /2, 0]}
            canSleep={false}
            lockRotations={false}
            restitution={1}
          >
            <CitizenYellow />
          </RigidBody>
        );
      })
      setCitizensYellow(yellowCitizens)
  }, []);

  function hostGameHandler() {
    navigate('/lobby');
  }

  return (
    <div className={styles.fullpage}>
      <div className={styles.pageWrapper}>
        <div className={styles.topBanner}>
          <button className={styles.music} onClick={toggleMute}>
            {muted ? <MdOutlineMusicOff /> : <SlMusicTone />}
          </button>
          <Header />
        </div>
        <div className={styles.canvasWrapper}>
          <div className={styles.introWrapper}>
            <h1 className={styles.heading}>Welcome to City Zen!</h1>
            <h3>Invite your friends</h3>
            <h3>Build an empire!</h3>
            <button className={styles.button} onClick={hostGameHandler}>
              Host a game!
            </button>
          </div>
          <Suspense fallback={<h1>Loading...</h1>}>

            <Canvas shadows camera={{ fov: 70, position: [0, 2, 8] }}>
              <Physics>
                <ambientLight intensity={1.25} />
                <Stars factor={2.5} />
                <Sky
                  sunPosition={sunPosition}
                  distance={50000}
                  inclination={10}
                  azimuth={0.5}
                  turbidity={0.5}
                  rayleigh={10}
                  mieDirectionalG={0.01}
                  mieCoefficient={0.005}
                />

                <OrbitControls
                  minDistance={2}
                  maxDistance={30}
                  enableRotate={true}
                  enableZoom={false}
                  maxPolarAngle={Math.PI / 2 - 0.1}
                  dampingFactor={0.8}
                  rotateSpeed={0.6}
                  target={[0, 3, 0]}
                />

                <directionalLight
                  intensity={2}
                  position={sunPosition}
                  shadow-normalBias={0.03}
                />
                <directionalLight
                  castShadow
                  intensity={4}
                  position={[-50, 23, 100]}
                  shadow-normalBias={0.03}
                />

                {citizensRed}
                {citizensBlue}
                {citizensGreen}
                {citizensYellow}

                <RigidBody
                  gravityScale={0.1}
                  position={[0, 5, 0]}
                  scale={0.095}
                  friction={100}
                  mass={100}
                  rotation={[0, 0, 0]}
                  canSleep={true}
                  lockRotations={true}
                  restitution={0}
                >
                  <CitizenRed />
                </RigidBody>

                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileA position={[-2, 0, 2]} scale={0.92} rotation={[0, Math.PI / 2, 0]}/>
                </RigidBody>

                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileD position={[0, 0, 0]} scale={0.92} />
                </RigidBody>
                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileE position={[-2, 0, 0]} scale={0.92} />
                </RigidBody>
                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileE position={[2, 0, 2]} scale={0.92} rotation={[0, Math.PI / 2, 0]}/>
                </RigidBody>
                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileF position={[2, 0, 0]} scale={0.92} />
                </RigidBody>
                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileK position={[0, 0, 2]} scale={0.92} />
                </RigidBody>
                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileS
                    position={[-2, 0, -2]}
                    scale={0.92}
                    rotation={[0, Math.PI / 2, 0]}
                  />
                </RigidBody>

                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileU position={[2, 0, -2]} scale={0.92} rotation={[0, Math.PI / 2, 0]}/>
                </RigidBody>

                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileU position={[0, 0, -4]} scale={0.92} />
                </RigidBody>

                <RigidBody
                  restitution={0}
                  enabledTranslations={[false, true, false]}
                  enabledRotations={[false, false, false]}
                >
                  <TileX position={[0, 0, -2]} scale={0.92} />
                </RigidBody>

                <RigidBody type="fixed">
                  <mesh receiveShadow position-y={-0.3}>
                    <boxGeometry args={[22, 0.5, 22]} />
                    <meshStandardMaterial color="#8f4111" />
                  </mesh>
                </RigidBody>
              </Physics>
            </Canvas>
          </Suspense>
        </div>

        <div className={styles.imagewrapper}>
          {/* <div className={styles.backgroundimage} /> */}
          
          <div className={styles.scrollableTextContainer}>
            {/* <Link className={styles.linkButton} to="/join">
            Join game
          </Link> */}
            <br></br>

            <h2>About:</h2>
            <p ref={aboutRef} className={styles.about}>
              {aboutText}{' '}
            </p>
            <Rules />
          </div>
        </div>

        <ProjectDescription />
      </div>

      <audio autoPlay={!muted}>
        <source src="/GameSound1.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
export default Home;
