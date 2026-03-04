const categories = [
    { name: 'Furniture', emoji: '🪑', color: '#F3E8FF' },
    { name: 'Hand Bag', emoji: '👜', color: '#FEE2E2' },
    { name: 'Books', emoji: '📚', color: '#DBEAFE' },
    { name: 'Tech', emoji: '💻', color: '#D1FAE5' },
    { name: 'Sneakers', emoji: '👟', color: '#FEF3C7' },
    { name: 'Travel', emoji: '✈️', color: '#E0E7FF' },
];

function Categories() {
    return (
        <section className="categories-section" id="categories">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Shop Our Top Categories</h2>
                </div>
                <div className="categories-grid">
                    {categories.map((cat, index) => (
                        <a href="#" className="category-card" key={index} id={`category-${cat.name.toLowerCase().replace(' ', '-')}`}>
                            <div className="category-icon" style={{ backgroundColor: cat.color }}>
                                <span>{cat.emoji}</span>
                            </div>
                            <span className="category-name">{cat.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Categories;
