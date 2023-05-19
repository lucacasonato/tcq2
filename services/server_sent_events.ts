export interface ServerSentEvent {
  event?: string;
  data?: string;
  id?: string;
  retry?: number;
}

export class ServerSentEventEncoderStream
  extends TransformStream<ServerSentEvent, string> {
  constructor() {
    super({
      transform(chunk, controller) {
        let message = "";
        if (chunk.event) {
          message += `event: ${chunk.event}\n`;
        }
        if (chunk.id) {
          message += `id: ${chunk.id}\n`;
        }
        if (chunk.retry) {
          message += `retry: ${chunk.retry}\n`;
        }
        if (chunk.data) {
          for (const line of chunk.data.split("\n")) {
            message += `data: ${line}\n`;
          }
        }
        if (message) {
          message += "\n";
          controller.enqueue(message);
        }
      },
    });
  }
}
