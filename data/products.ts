    export interface Product {
    name: string
    price: string
    image: string
    tag: string
    reviews: number
    }

    export const products: Product[] = [
    {
        name: "Difusor de Ambiente Orquídea",
        price: "89,90",
        image: "/products/produto-1.jpg",
        tag: "MAIS VENDIDO",
        reviews: 128,
    },
    {
        name: "Home Spray Lavanda",
        price: "69,90",
        image: "/products/produto-2.jpg",
        tag: "DESTAQUE",
        reviews: 96,
    },
    {
        name: "Vela Aromática Vanilla",
        price: "79,90",
        image: "/products/produto-3.jpg",
        tag: "LANÇAMENTO",
        reviews: 74,
    },
    {
        name: "Refil para Difusor Bambu",
        price: "49,90",
        image: "/products/produto-4.jpg",
        tag: "ECONOMIZE",
        reviews: 53,
    },
    ]