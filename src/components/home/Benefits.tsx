    const benefits = [
    {
        title: "ENVIO RÁPIDO",
        text: "Frete fixo de R$11,90",
        detail: "Consulte sua região",
    },
    {
        title: "PARCELE SUAS COMPRAS",
        text: "Em até 3x sem juros",
        detail: "",
    },
    {
        title: "SEGURANÇA",
        text: "Site 100% seguro",
        detail: "",
    },
    {
        title: "MAIS 5% OFF",
        text: "Em pagamento via PIX",
        detail: "",
    },
    ]

    export default function Benefits() {
    return (
        <section className="benefits">
        {benefits.map((benefit) => (
            <div className="benefit" key={benefit.title}>
            <div className="benefit-icon">✦</div>

            <div>
                <strong>{benefit.title}</strong>
                <p>{benefit.text}</p>
                {benefit.detail && <small>{benefit.detail}</small>}
            </div>
            </div>
        ))}
        </section>
    )
    }