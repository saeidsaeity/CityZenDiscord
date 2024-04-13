import { Suspense, useEffect, useState, useContext } from "react";
import { OrbitControls, Sky, Stars } from "@react-three/drei";

import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { useGameEngine } from "../../Context/useGameEngine.jsx";
import { myPlayer, RPC } from "playroomkit";
// Components
import { UI } from "../../components/Ui/UI.jsx";
import { GameBoardCells } from "../../components/GameBoardCells/GameBoardCells.jsx";
// 3D components
import { Citizen } from "../../assets/citizens/Citizen.jsx";
import TileD from "../../assets/tiles/tileD.jsx";
// styling
import styles from "./GameBoard.module.css";

import { BoardGameContext } from "../../Context/BoardGameContext.jsx";
import SpinnerLoader from "../../components/SpinnerLoader/SpinnerLoader.jsx";
import { useMemo } from "react";
import { TileContext } from "../../Context/TileContext.jsx";
import { TileMeshContext } from "../../Context/TileMeshContext.jsx";
import { TileRotationContext } from "../../Context/TileRotationContext.jsx";
import { TileDataContext } from "../../Context/TileDataContext.jsx";
import { BoardGameMatrixContext } from "../../Context/BoardGameMatrixContext.jsx";
import { RenderEnemyTileContext } from "../../Context/RenderEnemyTileContext.jsx";
import { randomTileGenerator } from "../../../utils.js";
import { TileTypeContext } from "../../Context/TileTypeContext.jsx";

const GameBoard = () => {
  // TILE
  const [enableRotate, setEnableRotate] = useState(true);
  const [sunPosition, setSunPosition] = useState([50, -6, 150]);
  const tileScale = [0.92, 0.92, 0.92];
  const tileSize = 2;
  const {
    citizenPosition,
    isCitizenPhase,
    showCitizen,
    citizenArray,
    setCitizenArray,
    setReleaseCitizen,
    setShowCitizen,
    setOtherPlayerTile,
    otherPlayerTile,
  } = useContext(BoardGameContext);
  const {
    setNewTile2DPosition,
    releaseTile,
    setReleaseTile,
    renderTileArr,
    setRenderTileArr,
    setShowTile,
    replaceTile,
    setReplaceTile
  } = useContext(TileContext);
  const { renderEnemyTile, setRenderEnemyTile } = useContext(
    RenderEnemyTileContext
  );
  const { newTileMesh, setNewTileMesh } = useContext(TileMeshContext);
  const { tileRotation } = useContext(TileRotationContext);
  const { setNewTileData, newTileData } = useContext(TileDataContext);
  const { setBoardGameMatrix } = useContext(BoardGameMatrixContext);
  const { setNewTileType } = useContext(TileTypeContext);
  const[tempCitizen,setTempCitizen]=useState([])
  // STATES //
  // CAMERA & ENVIRONMENT
  const {
    turnPhase,
    newTilePosition,

    players,
    playerTurn,
  } = useGameEngine();

  const drawEventHandler = async (tileType) => {
    const TileComponent = await import(
      `../../assets/tiles/tile${tileType}.jsx`
    );
    const renderNewTile = (
      <RigidBody
        key={tileType + "," + newTilePosition}
        canSleep={true}
        position={newTilePosition}
        rotation={[0, tileRotation, 0]}
        restitution={0}
        enabledTranslations={[false, true, false]}
        enabledRotations={[false, false, false]}
      >
        <TileComponent.default scale={tileScale} />
      </RigidBody>
    );
    // console.log(renderNewTile, "DRAW NEWT TILE");
    setNewTileMesh(renderNewTile);

    return renderNewTile;
  };

  const getRenderTileMesh = async (tileType, position, rotation) => {
    if (tileType !== undefined) {
      const TileComponent = await import(
        `../../assets/tiles/tile${tileType}.jsx`
      );
      const renderNewTile = (
        <RigidBody
          canSleep={false}
          position={position}
          rotation={[0, -rotation, 0]}
          scale={tileScale}
          restitution={0}
          enabledTranslations={[false, true, false]}
          enabledRotations={[false, false, false]}
          key={tileType + "," + position}
        >
          <TileComponent.default />
        </RigidBody>
      );
      // console.log(renderNewTile,'i am here');
      // console.log(renderNewTile, "RENDER NEW TILE");
      return renderNewTile;
    }
  };

  const renderCitizen = async (position, colour) => {
    const citizenComp = (
      <RigidBody
        key={position}
        gravityScale={0.5}
        position={position}
        scale={0.095}
        friction={100}
        mass={1000}
        rotation={[0, 0, 0]}
        canSleep={true}
        lockRotations={true}
        restitution={0}
      >
        <Citizen color={colour} />
      </RigidBody>
    );
    return citizenComp;
  };

  const me = myPlayer();
  useEffect(() => {
    RPC.register("tile", (data, caller) => {
      const splitkey = data.key.split("");

      getRenderTileMesh(
        splitkey[0],
        data.props.position,
        -data.props.rotation[1]
      ).then((tileMesh) => {
        setRenderTileArr((currArray) => {
          if (
            currArray.some((tile) => {
              return tile.key === splitkey[0] + "," + data.props.position;
            })
          ) {
            return currArray;
          }
          return [...currArray, tileMesh];
        });
      });
      setRenderEnemyTile(null);
      console.log(renderTileArr);
    });

    RPC.register("citizen", (data, caller) => {
      console.log(data);
      renderCitizen(data.position, data.colour).then((newcitizen) => {
        setCitizenArray((currArray) => {
          currArray.some((citizen) => {
            {
              return (
                citizen.key ===
                data.position[0] +
                  "," +
                  data.position[1] +
                  "," +
                  data.position[2]
              );
            }
          });

          if (
            currArray.some((citizen) => {
              return (
                JSON.stringify(citizen.props.position) ===
                JSON.stringify(data.position)
              );
            })
          ) {
            return [...new Set(currArray)];
          } else {
            const newArray = [...currArray, newcitizen];
            return [...new Set(newArray)];
          }
        });
        setReleaseCitizen(false);
      });
      setTempCitizen(null)
    });

    setShowCitizen(false);

    RPC.register("confirmMatrix", (data, caller) => {
      setBoardGameMatrix((currBoard) => {
        const newerBoard = JSON.parse(JSON.stringify(currBoard));
        newerBoard[data.pos1][data.pos2] = [newTileData];

        return newerBoard;
      });
    });
    RPC.register("confirmCitizen", (data, caller) => {
      setBoardGameMatrix(data);
    });

    RPC.register("enemyTile", (data, caller) => {
      console.log(data);
      console.log(data.pos);
      console.log(data.newTileMesh);
      const TileTypeEnemy = data.key.split("");
      getRenderTileMesh(
        TileTypeEnemy[0],
        data.props.position,
        -data.props.rotation[1]
      ).then((outputtile) => {
        console.log(outputtile);
        setRenderEnemyTile(outputtile);
      });
    });
    RPC.register("showCitizen",(data,caller)=>{

      renderCitizen(data.position,data.colour).then((citiz)=>
      setTempCitizen(citiz)
      )
    })
    RPC.register("initialTile",(data,caller)=>{
      if (me.id === player.id) {
      setReleaseTile(false);
          setShowTile(false);
          randomTileGenerator(74).then((randomTile)=>{

            setNewTileData(randomTile);
            drawEventHandler(randomTile.tile_type);
             // RPC.call('enemyTile',tileOutput,RPC.Mode.ALL)
             setNewTileType(randomTile.tile_type);
             setShowTile(true);
             setReplaceTile(true);
          })
          
        }
    })
  }, []);
  
  //console.log(renderEnemyTile);
  const player = players[playerTurn];
  // console.log(otherPlayerTile);
  // console.log(newTileMesh);
  // console.log(me);
  // RENDERING STARTS HERE //
  // console.log(me.id !== player.id );
  // console.log(renderEnemyTile);
  // console.log(releaseTile)
  //   console.log(replaceTile);
  console.log("here");
  console.log(newTilePosition);
  useEffect(()=>{
   
      RPC.call("initialTile", {}, RPC.Mode.ALL);
    
  },[playerTurn])

  return (
    <>
      <UI drawEventHandler={drawEventHandler} />

      <div className={styles.gameBoard}>
        <Suspense fallback={<SpinnerLoader />}>
          <Canvas shadows camera={{ fov: 70, position: [0, 8, 14] }}>
            <Physics>
              <ambientLight intensity={1.2} />
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

              <Stars factor={2.5} />

              <directionalLight
                castShadow
                intensity={1.5}
                position={[50, 50, 150]}
                shadow-normalBias={0.03}
              />

              <directionalLight
                castShadow
                intensity={5}
                position={sunPosition}
                shadow-normalBias={0.03}
              />

              <OrbitControls
                minDistance={2}
                maxDistance={30}
                enableRotate={enableRotate}
                maxPolarAngle={Math.PI / 2 - 0.1}
                // dampingFactor={0.8}
                rotateSpeed={0.6}
                target={[0, 2.25, 0]}
              />

              <RigidBody
                position={[0, 4, 0]}
                scale={tileScale}
                restitution={0}
                enabledTranslations={[false, true, false]}
                enabledRotations={[false, false, false]}
              >
                <TileD />
              </RigidBody>

              <GameBoardCells />

              {releaseTile && replaceTile ? newTileMesh : null}
              {me.id !== player.id ? tempCitizen : null}
              {me.id !== player.id ? renderEnemyTile : null}
              {turnPhase === "Place Citizen" &&
              citizenPosition.length > 0 &&
              showCitizen &&
              me ? (
                <RigidBody
                  key="visibleCitizen"
                  gravityScale={0.5}
                  position={citizenPosition}
                  scale={0.095}
                  friction={100}
                  mass={1000}
                  rotation={[0, 0, 0]}
                  canSleep={true}
                  lockRotations={true}
                  restitution={0}
                >
                  <Citizen color={me.state.profile.color} />
                </RigidBody>
              ) : null}
              {/* {otherPlayerTile ?  renderEnemyTile :null} */}
              {renderTileArr}
              {citizenArray}
              <RigidBody type="fixed">
                <mesh receiveShadow position-y={-0.3}>
                  <boxGeometry args={[22, 0.5, 22]} />
                  <meshStandardMaterial color="#8f4111" />
                </mesh>
              </RigidBody>
            </Physics>
            {newTilePosition && turnPhase === "Place Tile" ? (
              <mesh position={newTilePosition}>
                <boxGeometry args={[2, 10, 2]} />
                <meshBasicMaterial color="yellow" transparent opacity={0.3} />
              </mesh>
            ) : null}

            {/* HELPERS */}
            {/* <Perf position="top-left" /> */}
            {/* <axesHelper args={[5]} />
          <gridHelper args={[50, 25, "black", "red"]} /> */}
          </Canvas>
        </Suspense>
      </div>
    </>
  );
};

export default GameBoard;
