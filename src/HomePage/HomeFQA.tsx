import React, { useState } from "react";
import "../scss/HomeFQA.css";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    id: "01",
    question: "O que é o Teatro Lisboa?",
    answer:
      "O Teatro Lisboa é uma plataforma de streaming dedicada a espetáculos, peças de teatro, performances e conteúdos culturais, disponíveis para assistir quando e onde quiser.",
  },
  {
    id: "02",
    question: "Quanto custa o Teatro Lisboa?",
    answer:
      "O custo do Teatro Lisboa pode variar consoante o tipo de acesso ou espetáculo. Algumas produções podem ser gratuitas, enquanto outras requerem bilhete ou subscrição.",
  },
  {
    id: "03",
    question: "Que conteúdos estão disponíveis no Teatro Lisboa?",
    answer:
      "No Teatro Lisboa pode encontrar peças de teatro, gravações exclusivas, espetáculos contemporâneos, clássicos do repertório e conteúdos especiais produzidos para a plataforma.",
  },
  {
    id: "04",
    question: "Como posso assistir ao Teatro Lisboa?",
    answer:
      "Pode assistir ao Teatro Lisboa através do seu navegador ou dispositivo compatível, bastando criar uma conta e adquirir o acesso ao conteúdo desejado.",
  },
  {
    id: "05",
    question: "Como posso criar uma conta no Teatro Lisboa?",
    answer:
      "Para criar uma conta, clique em ‘Registar’, preencha os seus dados e siga os passos indicados para concluir o registo.",
  },
  {
    id: "06",
    question: "O Teatro Lisboa tem período experimental?",
    answer:
      "Alguns conteúdos do Teatro Lisboa podem estar disponíveis gratuitamente por tempo limitado. Consulte a plataforma para saber mais sobre campanhas ativas.",
  },
  {
    id: "07",
    question: "Como posso contactar o apoio ao cliente do Teatro Lisboa?",
    answer:
      "Pode contactar o apoio ao cliente através da secção ‘Contacto’ no site ou enviando um email para o endereço indicado na plataforma.",
  },
  {
    id: "08",
    question: "Quais são os métodos de pagamento aceites?",
    answer:
      "O Teatro Lisboa aceita diversos métodos de pagamento, incluindo cartões de crédito e outras opções digitais, consoante a disponibilidade.",
  },
];

export default function HomeFQA() {
  const [openId, setOpenId] = useState<string | null>("01");

  const toggle = (id: string): void => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="fqa" aria-labelledby="fqa-title">
      <div className="fqa__inner">
        <div className="fqa__header">
          <div>
            <h2 id="fqa-title" className="fqa__title">
              Perguntas Frequentes
            </h2>
            <p className="fqa__subtitle">
              Tem dúvidas? Nós temos respostas. Consulte a nossa secção de FAQ para
              encontrar respostas às perguntas mais comuns sobre o Teatro Lisboa.
            </p>
          </div>

          <button type="button" className="fqa__cta">
            Fazer uma pergunta
          </button>
        </div>

        <div className="fqa__grid">
          {FAQS.map((item) => {
            const isOpen = item.id === openId;

            return (
              <div
                key={item.id}
                className={`fqaItem ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="fqaItem__header"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                >
                  <span className="fqaItem__index">{item.id}</span>
                  <span className="fqaItem__question">{item.question}</span>
                  <span className="fqaItem__icon">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="fqaItem__body">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
