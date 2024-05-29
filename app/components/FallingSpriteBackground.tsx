"use client";
import { useEffect, useRef, useState } from "react";

type CoinState = {
  x: number;
  y: number;
  dy: number;
  s: number;
  state: number;
};

export default function FallingSpriteBackground({
  spriteXSize,
  spriteYSize,
  numberOfSprites,
  startingYPos = 0,
  zIndex = -1,
  displayXSize = 48,
  displayYSize = 48,
  acceleration = 0.01,
}: {
  spriteXSize: number;
  spriteYSize: number;
  numberOfSprites: number;
  startingYPos?: number;
  zIndex?: number;
  displayXSize?: number;
  displayYSize?: number;
  acceleration?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    //fix devicePixelRatio for bluriness
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    const coin = new Image();
    const coins: CoinState[] = [];

    coin.src = "/tick-coin-sprite.png";
    coin.onload = () => {
      drawloop();
      console.log("coin loaded");
      setActive(true);
    };

    const drawloop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (active) {
        requestAnimationFrame(drawloop);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.1) {
        const newState: CoinState = {
          x: Math.random() * canvas.width, //random x position
          y: startingYPos, //start from top
          dy: Math.random() * 2 + 1, //random speed
          s: Math.random() * 0.5 + 0.5, //random size
          state: Math.floor(Math.random() * numberOfSprites),
        };
        coins.push(newState);
      }
      var i = coins.length;
      //update coins movement
      while (i--) {
        var x = coins[i].x;
        var y = coins[i].y;
        var s = coins[i].s;
        var state = coins[i].state;
        coins[i].state = state > numberOfSprites - 1 ? 0 : state + 0.1;
        coins[i].dy += acceleration;
        coins[i].y += coins[i].dy;

        if (!coin) return;
        ctx.drawImage(
          coin,
          spriteXSize * Math.floor(state),
          0,
          spriteXSize,
          spriteYSize,
          x,
          y,
          displayXSize * s,
          displayYSize * s
        );

        if (y > canvas.height) {
          coins.splice(i, 1);
        }
      }
    };
  }, [acceleration, active, displayXSize, displayYSize, numberOfSprites, spriteXSize, spriteYSize, startingYPos]);

  return (
    <div
      className="absolute w-full h-full top-0 left-0"
      style={{
        zIndex: zIndex,
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
