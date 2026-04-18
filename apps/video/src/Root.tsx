import { Composition } from "remotion";
import { Hero } from "./compositions/Hero";

export const Root = () => {
  return (
    <>
      <Composition
        id="Hero"
        component={Hero}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
