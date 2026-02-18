import React from "react";
import "../scss/AboutUsInfo.css";

function AboutUsInfo() {
  return (
    <section className="aboutInfo">
      <div className="aboutInfo__inner">
        <div className="aboutInfo__left">
          <h2 className="aboutInfo__title">
            About harness multimedia based collaboration
          </h2>

          <span className="aboutInfo__subtitle">
            ORGANICALLY GROW THE HOLISTIC WORLD VIEW
          </span>
        </div>

        <div className="aboutInfo__right">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            posuere erat a ante venenatis dapibus posuere velit aliquet. Cras
            mattis consectetur purus sit amet fermentum. Maecenas sed diam
            eget risus varius blandit sit amet non magna.
          </p>

          <p>
            Curabitur blandit tempus porttitor. Aenean lacinia bibendum nulla
            sed consectetur. Vestibulum id ligula porta felis euismod semper.
            Donec ullamcorper nulla non metus auctor fringilla.
          </p>

          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
            Nullam id dolor id nibh ultricies vehicula ut id elit. Donec sed
            odio dui.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutUsInfo;
