    import { products } from "@/data/products"
    import ProductCard from "../products/ProductCard"

    export default function BestSellers() {
    return (
        <section className="best-sellers" id="produtos">
        <div className="section-heading">
            <span>OS QUERIDINHOS</span>

            <h2>Os Mais Vendidos</h2>

            <p>Os queridinhos das nossas clientes!</p>
        </div>

        <div className="products-grid">
            {products.map((product) => (
            <ProductCard
                key={product.name}
                product={product}
            />
            ))}
        </div>

        <a href="/produtos" className="outline-button">
            VER TODOS OS PRODUTOS →
        </a>
        </section>
    )
    }