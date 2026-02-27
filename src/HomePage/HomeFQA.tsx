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
    question: "O que é o Cinema Teatral OTL?",
    answer:
      "O Cinema Teatral OTL é uma plataforma digital criada pela Oficinas Teatro Lisboa que disponibiliza obras teatrais concebidas para o ecrã.\n\nNão se trata de teatro simplesmente filmado, mas de objetos cinematográficos performativos que resultam de um processo artístico que cruza criação teatral e linguagem audiovisual.\n\nO Cinema Teatral prolonga a vida das criações da OTL, tornando-as acessíveis para além do espaço físico e do momento efémero da apresentação.",
  },
  {
    id: "02",
    question: "Que conteúdos estão disponíveis no Cinema Teatral OTL?",
    answer:
      "A plataforma disponibiliza:\n\n· Criações originais desenvolvidas pela Oficinas Teatro Lisboa\n· Espetáculos adaptados para formato cinematográfico\n· Projetos experimentais híbridos entre teatro e cinema\n· Eventualmente, criações independentes de artistas convidados\n\nCada obra é apresentada como um filme teatral autónomo, com identidade própria.",
  },
  {
    id: "03",
    question: "Como posso criar uma conta no Cinema Teatral OTL?",
    answer:
      "Para criar uma conta basta:\n\n1. Aceder à página oficial do Cinema Teatral OTL\n2. Selecionar a opção “Criar Conta”\n3. Preencher os dados solicitados\n4. Confirmar o registo através do email enviado automaticamente\n5. Após o registo, poderá alugar e assistir aos conteúdos disponíveis.",
  },
  {
    id: "04",
    question: "Como posso contactar o apoio ao cliente do Cinema Teatral OTL?",
    answer:
      "Pode contactar-nos através de:\n\n· Email oficial indicado na plataforma\n· Formulário de contacto disponível no site\n\nA equipa responde com a maior brevidade possível em dias úteis.",
  },
  {
    id: "05",
    question: "Quanto custa uma peça no Cinema Teatral OTL?",
    answer:
      "O modelo do Cinema Teatral OTL baseia-se no aluguer individual por obra.\n\nO valor pode variar consoante a produção, mas situa-se, em regra, entre 9€ e 12€ por peça, garantindo acesso durante um período de 24 horas após a compra.\n\nO objetivo é manter um valor acessível, permitindo a sustentabilidade do projeto e o apoio à criação artística independente.",
  },
  {
    id: "06",
    question: "Como posso assistir ao Cinema Teatral OTL?",
    answer:
      "Após criar conta e concluir o aluguer:\n\n· Pode assistir através de computador, tablet ou smartphone\n· É necessária ligação à internet\n· O conteúdo fica disponível durante o período de aluguer indicado\n\nRecomendamos ligação estável e utilização de auscultadores ou sistema de som adequado para melhor experiência.",
  },
  {
    id: "07",
    question: "O Cinema Teatral OTL tem período experimental?",
    answer:
      "Atualmente, o Cinema Teatral OTL não dispõe de período experimental gratuito.\n\nO modelo é de aluguer individual por obra, permitindo ao espectador escolher especificamente o conteúdo que deseja assistir, sem necessidade de subscrição mensal.",
  },
  {
    id: "08",
    question: "Quais os métodos de pagamento aceites?",
    answer:
      "Os métodos de pagamento disponíveis incluem:\n\n· Cartão de crédito ou débito\n· Referência Multibanco\n· MB Way\n· Outros métodos digitais indicados na plataforma (conforme integração do sistema de pagamento)\n\nTodos os pagamentos são processados através de plataformas seguras.",
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
              {"Tem dúvidas? Nós temos respostas.\nConsulte a nossa secção de FAQ para encontrar respostas às perguntas mais comuns sobre o Cinema Teatral OTL"}
              
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
                  <span className="fqaItem__icon">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="fqaItem__body">
                    <p style={{ whiteSpace: "pre-line" }}>{item.answer}</p>
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