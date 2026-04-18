import { Composition } from "remotion";
import { Hero } from "./compositions/Hero";
import { Walkthrough } from "./compositions/Walkthrough";

export const Root = () => {
  return (
    <>
      <Composition id="Hero" component={Hero} durationInFrames={1200} fps={30} width={1920} height={1080} />
      <Composition id="Walkthrough" component={Walkthrough} durationInFrames={4650} fps={30} width={1920} height={1080} />
    </>
  );
};
