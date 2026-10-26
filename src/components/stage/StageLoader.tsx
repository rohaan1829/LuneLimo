"use client";

import dynamic from "next/dynamic";

/** The WebGL stage ships in its own chunk and never renders on the server. */
const Stage = dynamic(() => import("./Stage"), { ssr: false });

export function StageLoader() {
  return <Stage />;
}
