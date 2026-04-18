import { Composition } from "remotion";
import { HookKineticText } from "./scenes/HookKineticText";

export const Root = () => {
  return (
    <>
      <Composition
        id="HookKineticTextPreview"
        component={HookKineticText}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
