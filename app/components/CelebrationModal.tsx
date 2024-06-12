"use client";
import { useEffect, useRef, useState } from "react";

type CoinState = {
  x: number;
  y: number;
  dy: number;
  s: number;
  state: number;
};

const CelebrationModal = ({ coinAmt }: { coinAmt: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const resultQueue = useRef<CoinState[]>([]);

  useEffect(() => {
    if (active) {
      setTimeout(() => {
        setActive(false);
      }, 5000);
    }
  }, [active]);

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
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(`+${coinAmt} coins`, canvas.width / 2, canvas.height / 2);
    const coin = new Image();
    const coins: CoinState[] = [];
    coin.src = "/tick-coin-sprite.png";
    coin.onload = () => {
      drawloop();
      console.log("coin loaded");
      setActive(true);
    };
    let handle = 0;

    const drawloop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (active) {
        handle = requestAnimationFrame(drawloop);
      } else {
        cancelAnimationFrame(handle);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.1) {
        const newState: CoinState = {
          x: Math.random() * canvas.width, //random x position
          y: -10, //start from top
          dy: Math.random() * 2 + 1, //random speed
          s: Math.random() * 0.5 + 0.5, //random size
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
        coins[i].state = state > 15 ? 0 : state + 0.1;
        coins[i].dy += 0.01;
        coins[i].y += coins[i].dy;

        if (!coin) return;
        ctx.drawImage(
          coin,
          160 * Math.floor(state),
          0,
          160,
          160,
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
  }, [active]);

  return (
    <div className="absolute w-full h-full top-0 left-0 z-[999]">
      <div className="relative w-full h-full">
        <div className="bg-black w-full h-full opacity-30"></div>
        <canvas
          ref={canvasRef}
          className="absolute w-full h-full top-0 left-0 z-[1000]"
        />
      </div>
    </div>
  );
}

CelebrationModal.displayName = "CelebrationModal";
export default CelebrationModal;