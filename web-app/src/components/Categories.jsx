import { useQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi';
import { getCategoryIcon } from '../utils/categoryIcons';
import { LayoutGrid } from 'lucide-react';

function Categories({ activeCategory, onSelectCategory }) {
    const { data: dbCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: productApi.getCategories
    });

    const categories = dbCategories
    .filter((cat, index, list) => {
        const normalizedName = cat.name.trim().toLowerCase();
        return index === list.findIndex(item => item.name.trim().toLowerCase() === normalizedName);
    })
    .map(cat => {
        const visual = getCategoryIcon(cat.name);
        // Map premium lifestyle images based on name
        let premiumImage = `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop`; // Sports/Product default
        
        switch(cat.name.toLowerCase()) {
            case 'watches': premiumImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'; break;
            case 'fashion': premiumImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=300&fit=crop'; break;
            case 'travel': premiumImage = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&h=300&fit=crop'; break;
            case 'bracelets': premiumImage = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop'; break;
            case 'utilities': premiumImage = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&h=300&fit=crop'; break;
            case 'services': premiumImage = 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=300&h=300&fit=crop'; break;
            // Add a few more common ones to avoid generic fallback
            case 'household': premiumImage = 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?w=300&h=300&fit=crop'; break;
            case 'beauty': premiumImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=300&h=300&fit=crop'; break;
        }

        return {
            _id: cat._id,
            name: cat.name,
            Icon: visual.Icon,
            color: visual.color,
            iconColor: visual.iconColor,
            image: premiumImage
        };
    });

    const displayCats = categories.length > 0 ? categories : [];

    return (
        <section className="b2b-categories-section">
            <div className="section-container">
                <div className="b2b-categories-row scrollable">
                    <button 
                        className={`category-premium-btn ${activeCategory === 'All' ? 'active' : ''}`}
                        onClick={() => onSelectCategory && onSelectCategory('All')}
                    >
                        <div className="category-image-wrapper">
                            <div className="category-image-skeleton">
                                <LayoutGrid size={32} />
                            </div>
                            <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=300&fit=crop" alt="All" className="category-img" />
                        </div>
                        <span className="premium-label">All Products</span>
                    </button>

                    {displayCats.map((cat, index) => (
                        <button
                            key={index}
                            className={`category-premium-btn ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                        >
                            <div className="category-image-wrapper">
                                <div className="category-image-skeleton" style={{ background: cat.color }}>
                                    <cat.Icon size={32} color={cat.iconColor} />
                                </div>
                                <img src={cat.image} alt={cat.name} className="category-img" loading="lazy" />
                            </div>
                            <span className="premium-label">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Categories;
