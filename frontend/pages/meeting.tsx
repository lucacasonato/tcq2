import { useRef } from "preact/hooks";
import { Signal, useSignal, useSignalEffect } from "@preact/signals";

import { Meeting, User } from "../../services/models.ts";
import { Header } from "../components/header.tsx";

export default function Index(props: {
  user: User | null;
  params: Record<string, string>;
}) {
  const { id } = props.params;

  const connected = useSignal(false);
  const meeting = useSignal<Meeting | null>(null);
  const chairs = useSignal<User[] | null>(null);

  useSignalEffect(() => {
    const es = new EventSource(`/meetings/${id}/events`);
    es.onopen = () => connected.value = true;
    es.onerror = () => connected.value = false;
    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      switch (event.type) {
        case "meeting":
          meeting.value = event.data;
          break;
        case "chairs":
          chairs.value = event.data;
          break;
      }
    };
    return () => es.close();
  });

  return (
    <>
      <Header user={props.user} />
      <div class="grid gap-4 m-2 grid-cols-3 items-center border-2 border-gray-200 py-2 px-4 rounded-lg">
        <MeetingInfo meeting={meeting} />
        <Chairs id={id} user={props.user} chairs={chairs} />
        <ConnectionState connected={connected} />
      </div>
    </>
  );
}

function MeetingInfo(params: { meeting: Signal<Meeting | null> }) {
  if (!params.meeting.value) return <div />;
  return <h2 class="text-xl font-bold">{params.meeting.value.name}</h2>;
}

function Chairs(
  params: { id: string; user: User | null; chairs: Signal<User[] | null> },
) {
  const ref = useRef<HTMLDialogElement>(null);

  if (!params.chairs.value) return <div />;
  // Stacked avatars with name when hovered
  return (
    <div class="flex justify-center items-center gap-1">
      {params.chairs.value.map((chair) => (
        <img
          src={chair.avatarUrl}
          alt={chair.login}
          title={chair.login}
          class="w-8 h-8 rounded-full"
        />
      ))}
      {params.chairs.value.find((chair) =>
        chair.githubId === params.user?.githubId
      ) && (
        <button
          class="bg-gray(100 hover:200) w-8 h-8 text-sm rounded-full"
          onClick={() => ref.current!.showModal()}
        >
          +
        </button>
      )}
      <dialog ref={ref} class="border-2 border-gray-200 p-4 rounded-lg">
        <form
          action={`/meetings/${params.id}/chairs`}
          method="post"
          autoComplete="off"
        >
          <h2 class="text-xl font-medium mb-4">Add a chair</h2>
          <div class="flex flex-col mb-4">
            <label for="username" class="mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              class="border-2 border-gray-200 p-2 px-4 rounded-lg"
            />
          </div>
          <div class="flex gap-4">
            <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Add
            </button>
            <button
              formMethod="dialog"
              class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function ConnectionState(params: { connected: Signal<boolean> }) {
  return (
    <div class="text-right">
      {params.connected.value ? "Connected 🟢" : "Disconnected 🔴"}
    </div>
  );
}
