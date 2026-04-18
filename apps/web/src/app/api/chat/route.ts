import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SKILLOrchestrator } from "@/server/services/skill-orchestrator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { conversationId, content, submissionStatus } = body;

  if (!conversationId || !content) {
    return new Response("Missing conversationId or content", { status: 400 });
  }

  const orchestrator = new SKILLOrchestrator(prisma);

  const { systemPrompt, messages, phase } = await orchestrator.sendMessage({
    conversationId,
    userId: session.user.id,
    content,
    submissionStatus,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send phase info first
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "phase", phase })}\n\n`)
        );

        for await (const chunk of orchestrator.streamResponse({
          systemPrompt,
          messages,
          conversationId,
          phase,
        })) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
