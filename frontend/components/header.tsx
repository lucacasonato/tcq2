import { User } from "../../services/models.ts";

export function Header(props: { user: User | null }) {
  return (
    <header class="bg-gray-100 border(b 2 gray-200) flex justify-between items-center p-4">
      <div class="text-4xl font-bold">TCQ 2.0</div>
      {props.user && (
        <div class="flex flex-col items-end">
          <div>Hello, @{props.user.login}!</div>
          <div class="flex gap-4">
            <a
              href="/settings"
              class="text-blue(500 hover:600) hover:underline"
            >
              Settings
            </a>
            <a href="/logout" class="text-blue(500 hover:600) hover:underline">
              Logout
            </a>
          </div>
        </div>
      )}
      {!props.user && (
        <a href="/login" class="text-blue(500 hover:600) hover:underline">
          Login
        </a>
      )}
    </header>
  );
}
