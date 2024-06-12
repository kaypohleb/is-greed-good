"use client";
import eventBus from "@/eventBus";
import { EventBusEvent } from "@/types";
import { useEffect, useState } from "react";
import CelebrationModal from "./CelebrationModal";

export default function Modal() {
  const [modal, setModal] = useState<JSX.Element | null>(null);
  useEffect(() => {
    eventBus.subscribe((event) => {
      console.log(event);
      const typedEvent = event as EventBusEvent;
      if (typedEvent.type === "celebrate") {
        setModal(<CelebrationModal coinAmt={parseInt(typedEvent.data)} />);
        setTimeout(() => {
          setModal(null);
        }, 5000);
      }
    });
  }, []);

  return modal ? modal : null;
}
