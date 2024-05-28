import React, { useCallback, useEffect } from "react";
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import useEmblaCarousel from "embla-carousel-react";

type PropType = {
  children: React.ReactNode;
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { children, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const logEmblaEvent = useCallback(
    (emblaApi: EmblaCarouselType, eventName: EmblaEventType) => {
      console.log(`Embla just triggered ${eventName}!`);
    },
    []
  );

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("slidesInView", logEmblaEvent);
      emblaApi.on("select", logEmblaEvent);
    }
    return () => {
      if (emblaApi) {
        emblaApi.off("slidesInView", logEmblaEvent);
        emblaApi.off("select", logEmblaEvent);
      }
    };
  }, [emblaApi, logEmblaEvent]);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        {children}
      </div>

      <div className="embla__controls">
        <div className="embla__dots">
          {scrollSnaps.length > 1 ? scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
              )}
            />
          )): null}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
