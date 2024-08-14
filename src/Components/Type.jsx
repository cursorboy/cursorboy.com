import React from "react";
import Typewriter from "typewriter-effect";

const Type = () => {
  return (
    <div className="TypeEffect">
      <Typewriter
        options={{
          strings: ["Programmer", "Chess Player", "Rock Climber","Marvel Fanatic","Jedi","GYM bro","Math Nerd"],
          autoStart: true,
          loop: true,
          delay: 70,
          deleteSpeed: 20,
        }}
      />
    </div>
  );
};

export default Type;
