import { person } from "@/content/portfolio";
import { ViewTransition } from "@/lib/viewTransition";
import NameLetters from "@/components/NameLetters";
import MagneticIndex from "@/components/MagneticIndex";
import PiamPeek from "@/components/PiamPeek";
import RippleBackground from "@/components/RippleBackground";

/**
 * Home — the kinetic name field and a quiet worded index. Selecting an entry
 * carries `nav-forward`, so the name scatters into blur while the chosen scene
 * slides in. No corner pills, no numbers to press.
 */
export default function Home() {
  return (
    <ViewTransition
      enter={{ "nav-back": "nav-back", default: "scene-in" }}
      exit={{ "nav-forward": "home-out", default: "none" }}
      default="none"
    >
      <main className="home">
        <RippleBackground />
        <div className="homeInner">
          <p className="eyebrow homeRole">{person.role}</p>
          <h1 className="srOnly">
            {person.first} {person.last}
          </h1>
          <NameLetters />

          <MagneticIndex />
        </div>
        <PiamPeek />
      </main>
    </ViewTransition>
  );
}
