

const products = [
    {
        id: 1,
        name: 'Hand Watch',
        subtitle: 'Citizen 450M, W-50g',
        price: '$299.00',
        emoji: '⌚',
        useImage: false,
    },
    {
        id: 2,
        name: 'Adidas Sneakers',
        subtitle: 'Superstar sneakers',
        price: '$120.00',
        image: 'https://via.placeholder.com/300x300.png?text=Adidas+Sneakers',
        useImage: true,
    },
    {
        id: 3,
        name: 'Supreme Water Bottle',
        subtitle: 'Table with air purifier',
        price: '$45.00',
        emoji: '🍶',
        useImage: false,
    },
    {
        id: 4,
        name: 'Smart Watch',
        subtitle: 'Series 7, GPS + Cellular',
        price: '$399.00',
        image: 'https://via.placeholder.com/300x300.png?text=Smart+Watch',
        useImage: true,
    },
];

function MostSelling() {
    return (
        <section className="selling-section" id="most-selling">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Most Selling Products</h2>
                    <a href="#" className="section-link">See all →</a>
                </div>
                <div className="selling-grid">
                    {products.map((product) => (
                        <div className="selling-card" key={product.id} id={`selling-${product.id}`}>
                            <div className="selling-image-wrapper">
                                {product.useImage ? (
                                    <img src={product.image} alt={product.name} className="selling-image" />
                                ) : (
                                    <span className="selling-emoji">{product.emoji}</span>
                                )}
                            </div>
                            <div className="selling-info">
                                <h4 className="selling-name">{product.name}</h4>
                                <p className="selling-subtitle">{product.subtitle}</p>
                                <span className="selling-price">{product.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default MostSelling;
