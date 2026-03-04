const services = [
    {
        id: 1,
        icon: '❓',
        title: 'Frequently Asked Questions',
        description: 'Updates on safe Shopping in our Stores',
        color: '#EFF6FF',
    },
    {
        id: 2,
        icon: '💳',
        title: 'Online Payment Process',
        description: 'Updates on safe Shopping in our Stores',
        color: '#F0FDF4',
    },
    {
        id: 3,
        icon: '🚚',
        title: 'Home Delivery Options',
        description: 'Updates on safe Shopping in our Stores',
        color: '#FEF3C7',
    },
];

function Services() {
    return (
        <section className="services-section" id="services">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Services To Help You Shop</h2>
                </div>
                <div className="services-grid">
                    {services.map((service) => (
                        <a href="#" className="service-card" key={service.id} id={`service-${service.id}`}>
                            <div className="service-icon" style={{ backgroundColor: service.color }}>
                                <span>{service.icon}</span>
                            </div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-description">{service.description}</p>
                            <span className="service-arrow">→</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Services;
