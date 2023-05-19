import { User } from "../../services/models.ts";
import { Header } from "../components/header.tsx";

export default function Index(props: {
  user: User | null;
  params: Record<string, string>;
}) {
  return (
    <>
      <Header user={props.user} />
      <div class="grid grid-cols-2 gap-4 m-4">
        <form
          action="/meetings"
          method="post"
          class="border-2 border-gray-200 p-4 rounded-lg"
          autoComplete="off"
        >
          <h2 class="text-xl font-medium mb-4">Create a meeting</h2>
          <div class="flex flex-col mb-4">
            <label for="meeting-name" class="mb-2 font-medium">
              Meeting Name
            </label>
            <input
              type="text"
              id="meeting-name"
              name="meetingName"
              class="border-2 border-gray-200 p-2 px-4 rounded-lg"
            />
          </div>
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Create
          </button>
        </form>
      </div>
    </>
  );
}
