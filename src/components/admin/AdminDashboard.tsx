    "use client"

    import { ChangeEvent, FormEvent, useEffect, useState } from "react"
    import { createClient } from "@/lib/supabase/client"

    type Category = {
    id: string
    name: string
    }

    type Banner = {
    id: string
    title: string
    image_url: string
    link_url: string | null
    device: "desktop" | "mobile"
    sort_order: number
    active: boolean
    }

    type Product = {
    id: string
    name: string
    slug: string
    description: string | null
    base_price: number
    status: "draft" | "published"
    is_active: boolean
    category_id: string | null
    categories?: {
        name: string
    }[] | null
    }

    const supabase = createClient()

    export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"banners" | "products">(
        "banners",
    )

    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)

    const [banners, setBanners] = useState<Banner[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const [bannerForm, setBannerForm] = useState({
        title: "",
        link_url: "",
        device: "desktop" as "desktop" | "mobile",
        sort_order: 0,
        active: true,
    })

    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [uploadingBanner, setUploadingBanner] = useState(false)

    const [productForm, setProductForm] = useState({
        name: "",
        slug: "",
        description: "",
        base_price: "",
        category_id: "",
        status: "draft" as "draft" | "published",
        is_active: true,
    })

    const [productFile, setProductFile] = useState<File | null>(null)
    const [creatingProduct, setCreatingProduct] = useState(false)

    useEffect(() => {
        checkAdmin()
    }, [])

    async function checkAdmin() {
        setLoading(true)

        const {
        data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
        window.location.href = "/login"
        return
        }

        const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

        if (error || profile?.role !== "admin") {
        setAuthorized(false)
        setLoading(false)
        return
        }

        setAuthorized(true)

        await Promise.all([
        loadBanners(),
        loadProducts(),
        loadCategories(),
        ])

        setLoading(false)
    }

    async function loadBanners() {
        const { data, error } = await supabase
        .from("site_banners")
        .select("*")
        .order("sort_order", { ascending: true })

        if (error) {
        console.error(error)
        return
        }

        setBanners(data ?? [])
    }

    async function loadProducts() {
        const { data, error } = await supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            description,
            base_price,
            status,
            is_active,
            category_id,
            categories (
            name
            )
        `)
        .order("created_at", { ascending: false })

        if (error) {
        console.error(error)
        return
        }

        setProducts((data ?? []) as Product[])
    }

    async function loadCategories() {
        const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("priority", { ascending: true })

        if (error) {
        console.error(error)
        return
        }

        setCategories(data ?? [])
    }

    async function uploadBanner(file: File) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"

        const fileName = `desktop-${crypto.randomUUID()}.${extension}`

        const { error } = await supabase.storage
        .from("site-banners")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        })

        if (error) {
        throw error
        }

        const {
        data: { publicUrl },
        } = supabase.storage
        .from("site-banners")
        .getPublicUrl(fileName)

        return publicUrl
    }

    async function handleCreateBanner(event: FormEvent) {
        event.preventDefault()

        if (!bannerFile) {
        alert("Selecione uma imagem para o banner.")
        return
        }

        try {
        setUploadingBanner(true)

        const imageUrl = await uploadBanner(bannerFile)

        const { error } = await supabase.from("site_banners").insert({
            title: bannerForm.title || "Banner",
            image_url: imageUrl,
            link_url: bannerForm.link_url || null,
            device: bannerForm.device,
            sort_order: Number(bannerForm.sort_order),
            active: bannerForm.active,
        })

        if (error) {
            throw error
        }

        setBannerForm({
            title: "",
            link_url: "",
            device: "desktop",
            sort_order: banners.length,
            active: true,
        })

        setBannerFile(null)

        const input = document.getElementById(
            "banner-file",
        ) as HTMLInputElement | null

        if (input) {
            input.value = ""
        }

        await loadBanners()

        alert("Banner criado com sucesso.")
        } catch (error) {
        console.error(error)
        alert("Não foi possível criar o banner.")
        } finally {
        setUploadingBanner(false)
        }
    }

    async function toggleBanner(banner: Banner) {
        const { error } = await supabase
        .from("site_banners")
        .update({
            active: !banner.active,
        })
        .eq("id", banner.id)

        if (error) {
        console.error(error)
        alert("Não foi possível atualizar o banner.")
        return
        }

        await loadBanners()
    }

    async function deleteBanner(banner: Banner) {
        const confirmed = window.confirm(
        "Tem certeza que deseja excluir este banner?",
        )

        if (!confirmed) return

        const fileName = banner.image_url.split("/").pop()

        if (fileName) {
        await supabase.storage
            .from("site-banners")
            .remove([fileName])
        }

        const { error } = await supabase
        .from("site_banners")
        .delete()
        .eq("id", banner.id)

        if (error) {
        console.error(error)
        alert("Não foi possível excluir o banner.")
        return
        }

        await loadBanners()
    }

    function createSlug(value: string) {
        return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    function handleProductNameChange(value: string) {
        setProductForm((current) => ({
        ...current,
        name: value,
        slug: createSlug(value),
        }))
    }

    async function uploadProductImage(
        file: File,
        productId: string,
    ) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"

        const fileName = `products/${productId}/${crypto.randomUUID()}.${extension}`

        const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        })

        if (error) {
        throw error
        }

        const {
        data: { publicUrl },
        } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName)

        return publicUrl
    }

    async function handleCreateProduct(event: FormEvent) {
        event.preventDefault()

        if (!productForm.name.trim()) {
        alert("Informe o nome do produto.")
        return
        }

        if (!productForm.base_price) {
        alert("Informe o preço do produto.")
        return
        }

        try {
        setCreatingProduct(true)

        const { data: product, error } = await supabase
            .from("products")
            .insert({
            name: productForm.name,
            slug: productForm.slug,
            description: productForm.description || null,
            base_price: Number(productForm.base_price),
            category_id: productForm.category_id || null,
            status: productForm.status,
            is_active: productForm.is_active,
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        if (productFile && product) {
            const imageUrl = await uploadProductImage(
            productFile,
            product.id,
            )

            const { error: imageError } = await supabase
            .from("product_images")
            .insert({
                product_id: product.id,
                url: imageUrl,
                alt_text: productForm.name,
                display_order: 0,
            })

            if (imageError) {
            console.error(imageError)
            alert(
                "Produto criado, mas houve um erro ao salvar a imagem.",
            )
            }
        }

        setProductForm({
            name: "",
            slug: "",
            description: "",
            base_price: "",
            category_id: "",
            status: "draft",
            is_active: true,
        })

        setProductFile(null)

        const input = document.getElementById(
            "product-file",
        ) as HTMLInputElement | null

        if (input) {
            input.value = ""
        }

        await loadProducts()

        alert("Produto criado com sucesso.")
        } catch (error) {
        console.error(error)
        alert("Não foi possível criar o produto.")
        } finally {
        setCreatingProduct(false)
        }
    }

    async function toggleProduct(product: Product) {
        const { error } = await supabase
        .from("products")
        .update({
            is_active: !product.is_active,
        })
        .eq("id", product.id)

        if (error) {
        console.error(error)
        alert("Não foi possível atualizar o produto.")
        return
        }

        await loadProducts()
    }

    async function changeProductStatus(
        product: Product,
        status: "draft" | "published",
    ) {
        const { error } = await supabase
        .from("products")
        .update({
            status,
        })
        .eq("id", product.id)

        if (error) {
        console.error(error)
        alert("Não foi possível atualizar o produto.")
        return
        }

        await loadProducts()
    }

    if (loading) {
        return (
        <main className="admin-loading">
            <p>Carregando painel...</p>
        </main>
        )
    }

    if (!authorized) {
        return (
        <main className="admin-unauthorized">
            <div>
            <h1>Acesso restrito</h1>
            <p>
                Você não possui permissão para acessar o painel
                administrativo.
            </p>

            <a href="/">Voltar para a loja</a>
            </div>
        </main>
        )
    }

    return (
        <main className="admin-page">
        <header className="admin-header">
            <div>
            <span className="admin-eyebrow">ORQUÍDEA ESSENCE</span>
            <h1>Painel administrativo</h1>
            <p>Gerencie banners, produtos e conteúdo da loja.</p>
            </div>

            <a href="/" className="admin-store-link">
            Ver loja
            </a>
        </header>

        <nav className="admin-tabs">
            <button
            type="button"
            className={activeTab === "banners" ? "active" : ""}
            onClick={() => setActiveTab("banners")}
            >
            Banners
            </button>

            <button
            type="button"
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
            >
            Produtos
            </button>
        </nav>

        {activeTab === "banners" && (
            <section className="admin-section">
            <div className="admin-section-header">
                <div>
                <span>HOME</span>
                <h2>Banners</h2>
                <p>
                    Adicione e gerencie as imagens exibidas no
                    carrossel da página inicial.
                </p>
                </div>
            </div>

            <div className="admin-grid">
                <form
                className="admin-card admin-form"
                onSubmit={handleCreateBanner}
                >
                <h3>Novo banner</h3>

                <label>
                    Título interno
                    <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(event) =>
                        setBannerForm((current) => ({
                        ...current,
                        title: event.target.value,
                        }))
                    }
                    placeholder="Banner principal"
                    />
                </label>

                <label>
                    Imagem
                    <input
                    id="banner-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setBannerFile(event.target.files?.[0] ?? null)
                    }
                    />
                </label>

                <label>
                    Link
                    <input
                    type="text"
                    value={bannerForm.link_url}
                    onChange={(event) =>
                        setBannerForm((current) => ({
                        ...current,
                        link_url: event.target.value,
                        }))
                    }
                    placeholder="/produtos"
                    />
                </label>

                <div className="admin-form-row">
                    <label>
                    Dispositivo
                    <select
                        value={bannerForm.device}
                        onChange={(event) =>
                        setBannerForm((current) => ({
                            ...current,
                            device: event.target.value as
                            | "desktop"
                            | "mobile",
                        }))
                        }
                    >
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                    </select>
                    </label>

                    <label>
                    Ordem
                    <input
                        type="number"
                        min="0"
                        value={bannerForm.sort_order}
                        onChange={(event) =>
                        setBannerForm((current) => ({
                            ...current,
                            sort_order: Number(event.target.value),
                        }))
                        }
                    />
                    </label>
                </div>

                <label className="admin-checkbox">
                    <input
                    type="checkbox"
                    checked={bannerForm.active}
                    onChange={(event) =>
                        setBannerForm((current) => ({
                        ...current,
                        active: event.target.checked,
                        }))
                    }
                    />

                    Banner ativo
                </label>

                <button
                    type="submit"
                    className="admin-primary-button"
                    disabled={uploadingBanner}
                >
                    {uploadingBanner
                    ? "Enviando..."
                    : "Adicionar banner"}
                </button>
                </form>

                <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Banners cadastrados</h3>
                    <span>{banners.length}</span>
                </div>

                <div className="banner-list">
                    {banners.length === 0 ? (
                    <div className="admin-empty">
                        Nenhum banner cadastrado.
                    </div>
                    ) : (
                    banners.map((banner) => (
                        <article
                        className="banner-item"
                        key={banner.id}
                        >
                        <img
                            src={banner.image_url}
                            alt={banner.title}
                        />

                        <div className="banner-item-info">
                            <strong>{banner.title}</strong>

                            <span>
                            {banner.device} · ordem{" "}
                            {banner.sort_order}
                            </span>

                            <span
                            className={
                                banner.active
                                ? "status active"
                                : "status inactive"
                            }
                            >
                            {banner.active
                                ? "Ativo"
                                : "Inativo"}
                            </span>
                        </div>

                        <div className="banner-actions">
                            <button
                            type="button"
                            onClick={() =>
                                toggleBanner(banner)
                            }
                            >
                            {banner.active
                                ? "Desativar"
                                : "Ativar"}
                            </button>

                            <button
                            type="button"
                            className="danger"
                            onClick={() =>
                                deleteBanner(banner)
                            }
                            >
                            Excluir
                            </button>
                        </div>
                        </article>
                    ))
                    )}
                </div>
                </div>
            </div>
            </section>
        )}

        {activeTab === "products" && (
            <section className="admin-section">
            <div className="admin-section-header">
                <div>
                <span>CATÁLOGO</span>
                <h2>Produtos</h2>
                <p>
                    Cadastre produtos e envie suas imagens para o
                    catálogo.
                </p>
                </div>
            </div>

            <div className="admin-grid">
                <form
                className="admin-card admin-form"
                onSubmit={handleCreateProduct}
                >
                <h3>Novo produto</h3>

                <label>
                    Nome
                    <input
                    type="text"
                    value={productForm.name}
                    onChange={(event) =>
                        handleProductNameChange(
                        event.target.value,
                        )
                    }
                    placeholder="Difusor Orquídea Branca"
                    />
                </label>

                <label>
                    Slug
                    <input
                    type="text"
                    value={productForm.slug}
                    onChange={(event) =>
                        setProductForm((current) => ({
                        ...current,
                        slug: event.target.value,
                        }))
                    }
                    placeholder="difusor-orquidea-branca"
                    />
                </label>

                <label>
                    Descrição
                    <textarea
                    value={productForm.description}
                    onChange={(event) =>
                        setProductForm((current) => ({
                        ...current,
                        description: event.target.value,
                        }))
                    }
                    placeholder="Descrição do produto..."
                    rows={4}
                    />
                </label>

                <div className="admin-form-row">
                    <label>
                    Preço
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={productForm.base_price}
                        onChange={(event) =>
                        setProductForm((current) => ({
                            ...current,
                            base_price: event.target.value,
                        }))
                        }
                        placeholder="89.90"
                    />
                    </label>

                    <label>
                    Categoria
                    <select
                        value={productForm.category_id}
                        onChange={(event) =>
                        setProductForm((current) => ({
                            ...current,
                            category_id: event.target.value,
                        }))
                        }
                    >
                        <option value="">
                        Selecione
                        </option>

                        {categories.map((category) => (
                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>
                        ))}
                    </select>
                    </label>
                </div>

                <label>
                    Imagem principal
                    <input
                    id="product-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                        setProductFile(
                        event.target.files?.[0] ?? null,
                        )
                    }
                    />
                </label>

                <label>
                    Status
                    <select
                    value={productForm.status}
                    onChange={(event) =>
                        setProductForm((current) => ({
                        ...current,
                        status: event.target.value as
                            | "draft"
                            | "published",
                        }))
                    }
                    >
                    <option value="draft">
                        Rascunho
                    </option>

                    <option value="published">
                        Publicado
                    </option>
                    </select>
                </label>

                <label className="admin-checkbox">
                    <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(event) =>
                        setProductForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                        }))
                    }
                    />

                    Produto ativo
                </label>

                <button
                    type="submit"
                    className="admin-primary-button"
                    disabled={creatingProduct}
                >
                    {creatingProduct
                    ? "Criando..."
                    : "Criar produto"}
                </button>
                </form>

                <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Produtos cadastrados</h3>
                    <span>{products.length}</span>
                </div>

                <div className="product-list">
                    {products.length === 0 ? (
                    <div className="admin-empty">
                        Nenhum produto cadastrado.
                    </div>
                    ) : (
                    products.map((product) => (
                        <article
                        className="product-item"
                        key={product.id}
                        >
                        <div>
                            <strong>{product.name}</strong>

                            <span>
                                {product.categories?.[0]?.name ||
                                "Sem categoria"}
                            </span>

                            <span>
                            R${" "}
                            {Number(
                                product.base_price,
                            ).toFixed(2).replace(".", ",")}
                            </span>
                        </div>

                        <div className="product-status">
                            <span
                            className={
                                product.status ===
                                "published"
                                ? "status active"
                                : "status inactive"
                            }
                            >
                            {product.status ===
                            "published"
                                ? "Publicado"
                                : "Rascunho"}
                            </span>

                            <span
                            className={
                                product.is_active
                                ? "status active"
                                : "status inactive"
                            }
                            >
                            {product.is_active
                                ? "Ativo"
                                : "Inativo"}
                            </span>
                        </div>

                        <div className="product-actions">
                            <button
                            type="button"
                            onClick={() =>
                                toggleProduct(product)
                            }
                            >
                            {product.is_active
                                ? "Desativar"
                                : "Ativar"}
                            </button>

                            <button
                            type="button"
                            onClick={() =>
                                changeProductStatus(
                                product,
                                product.status ===
                                    "published"
                                    ? "draft"
                                    : "published",
                                )
                            }
                            >
                            {product.status ===
                            "published"
                                ? "Rascunho"
                                : "Publicar"}
                            </button>
                        </div>
                        </article>
                    ))
                    )}
                </div>
                </div>
            </div>
            </section>
        )}
        </main>
    )
    }