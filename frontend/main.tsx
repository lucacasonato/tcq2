import { render } from "preact";
import "preact/debug";

import { defineConfig, install } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";

install(defineConfig({ presets: [presetTailwind()] }));

import Page, { data } from "./page.tsx";

const app = document.getElementById("app")!;
app.innerHTML = "";

render(<Page user={data.user} params={data.params} />, app);
