import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { colors } from "../theme/colors";
import { PainStatement } from "../scenes/PainStatement";
import { Thesis } from "../scenes/Thesis";
import { PracticePageOpen } from "../scenes/PracticePageOpen";
import { SuggestionChipsReveal } from "../scenes/SuggestionChipsReveal";
import { BeginnerWalkthrough } from "../scenes/BeginnerWalkthrough";
import { PhaseTransitionKnowledge } from "../scenes/PhaseTransitionKnowledge";
import { MonacoTyping } from "../scenes/MonacoTyping";
import { SubmissionAccepted } from "../scenes/SubmissionAccepted";
import { SkillTreeMastery } from "../scenes/SkillTreeMastery";
import { DailyRecommendation } from "../scenes/DailyRecommendation";
import { Outro } from "../scenes/Outro";
import { Caption } from "../ui/Caption";

/**
 * Walkthrough composition
 *   Total: 4650 frames @ 30fps = 155s (2:35)
 *   0-450      (0:00-0:15)  PainStatement
 *   450-750    (0:15-0:25)  Thesis
 *   750-1200   (0:25-0:40)  PracticePageOpen
 *   1200-1500  (0:40-0:50)  SuggestionChipsReveal
 *   1500-2250  (0:50-1:15)  BeginnerWalkthrough (walk variant)
 *   2250-3000  (1:15-1:40)  PhaseTransitionKnowledge
 *   3000-3600  (1:40-2:00)  MonacoTyping
 *   3600-3900  (2:00-2:10)  SubmissionAccepted
 *   3900-4200  (2:10-2:20)  SkillTreeMastery (walk variant, compressed to 300f)
 *   4200-4500  (2:20-2:30)  DailyRecommendation
 *   4500-4650  (2:30-2:35)  Outro
 */
export function Walkthrough() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Audio src={staticFile("bgm.mp3")} volume={0.5} />

      <Sequence from={0} durationInFrames={450}>
        <PainStatement />
      </Sequence>
      <Sequence from={450} durationInFrames={300}>
        <Thesis />
      </Sequence>

      <Sequence from={750} durationInFrames={450}>
        <PracticePageOpen />
        <Caption>Open any problem. Your test cases are visualized inline.</Caption>
      </Sequence>

      <Sequence from={1200} durationInFrames={300}>
        <SuggestionChipsReveal />
        <Caption>Not sure where to begin? Six starter prompts are built in.</Caption>
      </Sequence>

      <Sequence from={1500} durationInFrames={750}>
        <BeginnerWalkthrough variant="walk" />
        <Caption>The AI walks you through a real input — 3 concrete questions.</Caption>
      </Sequence>

      <Sequence from={2250} durationInFrames={750}>
        <PhaseTransitionKnowledge />
        <Caption>Your answers unlock the algorithmic pattern — Hash Table.</Caption>
      </Sequence>

      <Sequence from={3000} durationInFrames={600}>
        <MonacoTyping />
        <Caption>Code in Python · JavaScript · C · C++.</Caption>
      </Sequence>

      <Sequence from={3600} durationInFrames={300}>
        <SubmissionAccepted />
        <Caption>Runs in a Docker sandbox. No network. No surprises.</Caption>
      </Sequence>

      <Sequence from={3900} durationInFrames={300}>
        <SkillTreeMastery variant="walk" />
        <Caption>Every submission updates your mastery map.</Caption>
      </Sequence>

      <Sequence from={4200} durationInFrames={300}>
        <DailyRecommendation />
        <Caption>Tomorrow's problem is chosen for your weakest spot.</Caption>
      </Sequence>

      <Sequence from={4500} durationInFrames={150}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
