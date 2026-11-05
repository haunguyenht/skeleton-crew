import type { ReactElement } from "react";
import { Nav } from "./components/Nav";
import { Apps } from "./sections/Apps";
import { Architecture } from "./sections/Architecture";
import { Capabilities } from "./sections/Capabilities";
import { CodeSample } from "./sections/CodeSample";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { OpenSource } from "./sections/OpenSource";
import { Repository } from "./sections/Repository";
import { Stats } from "./sections/Stats";
import { Workflow } from "./sections/Workflow";

export default function App(): ReactElement {
  return (
    <div className="page">
      <div className="page__glow" aria-hidden="true" />
      <Nav />
      <main className="main">
        <Hero />
        <Stats />
        <Architecture />
        <Apps />
        <Workflow />
        <Capabilities />
        <CodeSample />
        <Repository />
        <OpenSource />
      </main>
      <Footer />
    </div>
  );
}
