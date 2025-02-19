'use client'

import { useState } from "react";
import Window from "./Window";

export default function TutorialWindow() {
    const [curStep, currentStep] = useState(0);
    
    function pageReturn(step: number){
        switch(step) {
            case 0: return (
                <div className="flex flex-col items-center">
                <div>The main problem</div>
                <div>
                    You have 5 coins. 
                    The machine has a slot with a chance of winning a multiplier of 2x
                </div>
                </div>
            )
            default: return (
                <div>blank</div>
            )
        }
    }
    return <Window title="Tutorial">
        {pageReturn(curStep)}
    </Window>
}