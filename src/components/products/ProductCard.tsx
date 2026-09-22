    import Image from "next/image"
    import { Product } from "@/data/products"

    interface Props {
    product: Product
    }

    export default function ProductCard({ product }: Props) {
    return (
        <article className="product-card">
        <div className="product-image">
            <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            />

            <span className="product-tag">{product.tag}</span>
        </div>

        <div className="product-info">
            <h3>{product.name}</h3>

            <div className="reviews">
            <span>★★★★★</span>
            <small>({product.reviews})</small>
            </div>

            <strong className="product-price">
            R$ {product.price}
            </strong>

            <button className="add-cart">
            ADICIONAR AO CARRINHO
            <span>+</span>
            </button>
        </div>
        </article>
    )
    }