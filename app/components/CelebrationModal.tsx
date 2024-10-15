"use client";
import { useEffect, useRef, useState } from "react";

type ArcCoinState = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  s: number;
  state: number;
};

const COIN_HEIGHT = 160;

const CelebrationModal = ({ coinAmt }: { coinAmt: number }) => {
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
    const canvas = canvasRef.current;
    //draw number on canvas
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    //draw coinamount on canvas

    //ctx.font = "48px Arial";
    //ctx.textAlign = "center";
    //ctx.fillText(`+${coinAmt} coins`, canvas.width / 2, canvas.height / 2);
    const coin = new Image();
    const coins: ArcCoinState[] = [];
    coin.src = "/tick-coin-sprite.png";
    coin.onload = () => {
      //if (coins.length <= 0) return;
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
      

      if (Math.random() < 0.4 && coins.length < coinAmt) {
        const newState: ArcCoinState = {
          x: Math.random() * canvas.width, //random x position
          y: 0, //start from bottom
          dx: (Math.random() * 1 + 1) * (Math.random() < 0.5 ? -1 : 1), //random speed and direction
          dy: Math.random() * 2 + 1, //random speed
          s: Math.random() * 0.5 + 0.8, //random size
          state: 0,
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
        coins[i].state = state > 15 - 1 ? 0 : state + 0.1;
        //slow down when close to bottom
        coins[i].y = y + coins[i].dy;
        coins[i].dy = y > canvas.height - COIN_HEIGHT ? 0 : coins[i].dy + 0.01;
        //make x coins bounce off walls
        coins[i].x = x + coins[i].dx;
        if (x > canvas.width - COIN_HEIGHT || x < COIN_HEIGHT) {
          coins[i].dx = -coins[i].dx;
        }

        if (!coin) return;
        ctx.drawImage(
          coin,
          COIN_HEIGHT * Math.floor(state),
          0,
          COIN_HEIGHT,
          COIN_HEIGHT,
          x,
          y,
          32 * s,
          32 * s
        );

        if (y > canvas.height) {
          coins.splice(i, 1);
        }
      }
    };
  }, [active, coinAmt]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full top-0 left-0 z-[1000] bg-black/40"
      />
      <div className="absolute top-1/2 left-1/2 z-[1001] text-[100px] text-white text-center -translate-x-1/2 -translate-y-1/2">
        +{coinAmt} coins
      </div>
    </div>
  );
};

CelebrationModal.displayName = "CelebrationModal";
export default CelebrationModal;
