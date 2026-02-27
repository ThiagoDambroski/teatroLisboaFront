import React from "react";
import "../scss/AboutUsInfo.css";

const ORIGIN_STEPS: string[] = [
  "Da formação à criação",
  "Da criação ao objeto cinematográfico",
  "Do objeto ao arquivo e à circulação digital",
];

function AboutUsInfo() {
  return (
    <section className="aboutInfo" aria-labelledby="aboutInfo-title">
      <div className="aboutInfo__inner">
        <header className="aboutInfo__header">
          <p className="aboutInfo__eyebrow">Sobre</p>
          <h2 id="aboutInfo-title" className="aboutInfo__title">
            Cinema Teatral OTL
          </h2>
          <p className="aboutInfo__lead">
            O Cinema Teatral OTL nasce no seio da Oficinas Teatro Lisboa como extensão natural de um
            percurso artístico consolidado ao longo de anos de criação e formação teatral.
          </p>
        </header>

        <div className="aboutInfo__content">
          <div className="aboutInfo__card">
            <h3 className="aboutInfo__sectionTitle">Sobre o Cinema Teatral OTL</h3>

            <div className="aboutInfo__prose">
              <p>
                Se o palco é o lugar do acontecimento efémero, o instante irrepetível entre
                intérprete e espectador, o Cinema Teatral é o espaço onde essa criação ganha uma
                segunda vida. Aqui, as obras deixam de pertencer apenas ao momento da apresentação e
                transformam-se em objetos cinematográficos performativos, concebidos com linguagem
                própria, pensados para o ecrã e para uma circulação que ultrapassa o espaço físico.
              </p>

              <p>
                O Cinema Teatral OTL não se limita a filmar teatro. Procura criar uma linguagem
                híbrida entre palco e cinema, onde o corpo do intérprete, a luz, o som e a câmara
                constroem uma nova dramaturgia visual. Cada obra é pensada como um objeto autónomo,
                mantendo a essência teatral, mas explorando a intimidade e a potência do
                enquadramento cinematográfico.
              </p>

              <p>
                Este projeto surge da necessidade de preservar, expandir e democratizar o acesso às
                criações desenvolvidas ao longo dos anos na OTL, criando um arquivo vivo e uma
                plataforma de difusão artística que permite que as obras continuem a dialogar com o
                público para além do tempo e do lugar da sua estreia.
              </p>
            </div>
          </div>

          <aside className="aboutInfo__aside" aria-label="A origem do Cinema Teatral">
            <div className="aboutInfo__panel">
              <h3 className="aboutInfo__sectionTitle">A Origem do Cinema Teatral</h3>

              <div className="aboutInfo__prose">
                <p>
                  O Cinema Teatral OTL nasce precisamente desta trajetória. Após anos de produção
                  teatral e de trabalho formativo contínuo, tornou-se evidente a necessidade de
                  criar um novo espaço de permanência para as obras.
                </p>
              </div>

              <div className="aboutInfo__steps" role="list">
                {ORIGIN_STEPS.map((text) => (
                  <div key={text} className="aboutInfo__step" role="listitem">
                    <span className="aboutInfo__dot" aria-hidden="true" />
                    <span className="aboutInfo__stepText">{text}</span>
                  </div>
                ))}
              </div>

              <div className="aboutInfo__quotes" aria-label="Síntese">
                <p className="aboutInfo__quote">
                  <span className="aboutInfo__quoteDash" aria-hidden="true">
                    —
                  </span>
                  Não substitui o palco, prolonga-o.
                </p>
                <p className="aboutInfo__quote">
                  <span className="aboutInfo__quoteDash" aria-hidden="true">
                    —
                  </span>
                  Não elimina o efémero, preserva-o e transforma-o.
                </p>
              </div>

              <div className="aboutInfo__prose">
                <p>
                  É a continuação de uma prática artística que entende o teatro não como um momento
                  isolado, mas como um processo contínuo de construção, reflexão e partilha.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default AboutUsInfo;