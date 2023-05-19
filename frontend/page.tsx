import { ComponentType } from "preact";
import { User } from "../services/models.ts";

interface Data {
  page: string;
  params: Record<string, string>;
  user: User | null;
}

const dataEl = document.getElementById("data")!;
export const data = JSON.parse(dataEl.innerHTML) as Data;

const { default: Page } = await import(`./pages/${data.page}.tsx`);
export default Page as ComponentType<
  { user: User | null; params: Record<string, string> }
>;
