import React, { useEffect } from "react";
import Skills from "./Skills.jsx";
import { FaFileDownload } from "react-icons/fa";
import profileImage from '../images/IMG_0314.jpg';

const About = () => {
  useEffect(() => {
    const scrollPrompt = document.querySelector(".scroll-down-prompt");

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        scrollPrompt.classList.add("fade-out");
      } else {
        scrollPrompt.classList.remove("fade-out");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="AboutPage">
        <div className="AboutText">
          <h1 className="AboutTextHeading">
            Get to <b>know</b> me!
          </h1>
          <p>
            Hi, my name is <b>Piam Parekh</b>.
            I'm a <b>Software Developer </b> and a second year
            student pursuing <b>BS in Mathematics</b> at University of California, Santa Barbara<br />
            <br />
            I grew up in the Bay Area and have been programming since I was 10 years old. 
            I have experience in web development, and have worked on projects using a variety of languages. 
            <br />
            <br />I am <b>open</b> to new collaborations or work where I can
            contribute and grow. Feel free to connect with me, links are in the
            footer, or put your information in the contact me 
            <br />
            Apart from coding I love to climb, play chess for my school team, workout, and go hiking. 
          </p>
          <a href="Resume.pdf" download className="resume-btn">
            <button>
              Download Resume <FaFileDownload></FaFileDownload>
            </button>
          </a>
        </div>
        <div className="AboutImage">
          <img src={profileImage} alt="Piam Parekh" className="profile-image" />
        </div>
      </div>
      <div className="scroll-down-prompt">
        <p>Scroll down</p>
        <span className="arrow">&#x2193;</span>
      </div>

      <h1 className="SkillsHeading"> Skillset</h1>
      <div className="skills">
        <Skills skill="HTML" />
        <Skills skill="CSS" />
        <Skills skill="Bootstrap" />
        <Skills skill="Tailwind" />
        <Skills skill="Javascript" />
        <Skills skill="React" />
        <Skills skill="Git" />
        <Skills skill="Github" />
        <Skills skill="C++" />
        <Skills skill="Figma" />
        <Skills skill="Npm" />
      </div>
    </>
  );
};

export default About;
