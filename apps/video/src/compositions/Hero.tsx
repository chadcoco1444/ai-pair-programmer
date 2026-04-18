import { AbsoluteFill, Sequence } from "remotion";
import { colors } from "../theme/colors";
import { HookKineticText } from "../scenes/HookKineticText";
import { SocraticChat } from "../scenes/SocraticChat";
import { BeginnerWalkthrough } from "../scenes/BeginnerWalkthrough";
import { SkillTreeMastery } from "../scenes/SkillTreeMastery";
import { Outro } from "../scenes/Outro";

/**
 * Hero composition
 *   Total: 1200 frames @ 30fps = 40s
 *   0-90   (0:00-0:03)  HookKineticText
 *   90-330 (0:03-0:11)  SocraticChat
 *   330-780 (0:11-0:26) BeginnerWalkthrough (hero variant)
 *   780-990 (0:26-0:33) SkillTreeMastery (hero variant)
 *   990-1200 (0:33-0:40) Outro
 */
export function Hero() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Sequence from={0} durationInFrames={90}>
        <HookKineticText />
      </Sequence>
      <Sequence from={90} durationInFrames={240}>
        <SocraticChat />
      </Sequence>
      <Sequence from={330} durationInFrames={450}>
        <BeginnerWalkthrough variant="hero" />
      </Sequence>
      <Sequence from={780} durationInFrames={210}>
        <SkillTreeMastery variant="hero" />
      </Sequence>
      <Sequence from={990} durationInFrames={210}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
