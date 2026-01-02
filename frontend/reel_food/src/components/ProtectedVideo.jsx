import React, {useState, useEffect, useRef, forwardRef, useCallback} from 'react';

const ProtectedVideo = forwardRef(({
    src,
    onContextMenu,
    ...props
}, ref) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [error, setError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const elementRef = useRef(null);

    // Initial Observation for Lazy Loading
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShouldLoad(true);
                observer.disconnect();
            }
        }, {rootMargin: '200px'});

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return() => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!shouldLoad || !src) 
            return;
        

        let active = true;
        let objUrl;

        const fetchVideo = async () => {
            try {
                const response = await fetch(src);
                if (! response.ok) 
                    throw new Error('Network response was not ok');
                
                const blob = await response.blob();
                if (active) {
                    objUrl = URL.createObjectURL(blob);
                    setBlobUrl(objUrl);
                }
            } catch (e) {
                console.error("Video load error", e);
                setError(true);
            }
        };

        fetchVideo();

        return() => {
            active = false;
            if (objUrl) 
                URL.revokeObjectURL(objUrl);
            
        };
    }, [shouldLoad, src]);


    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        if (onContextMenu) 
            onContextMenu(e);
        
    }, [onContextMenu]);

    const setRef = useCallback((node) => {
        elementRef.current = node;
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    }, [ref]);

    if (error) {
        return (
            <video ref={setRef}
                src={src}
                onContextMenu={handleContextMenu}
                {...props}/>
        );
    }

    return (
        <video ref={setRef}
            src={
                blobUrl || ""
            }
            onContextMenu={handleContextMenu}
            {...props}/>
    );
});

export default React.memo(ProtectedVideo);
