import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Whenever the route changes, instantly scroll to the top left
        window.scrollTo(0, 0);
    }, [pathname]);

    // This component renders nothing to the screen
    return null;
}
